const Task = require("../models/Task");
const Grievance = require("../models/Grievance");
const User = require("../models/User");
const { addHistory, notify } = require("../services/workflowService");

// ======================================================
// ASSIGN TASKS TO ONE OR MULTIPLE EMPLOYEES
// ======================================================

const assignTasks = async (req, res) => {
  try {
    const {
      grievanceId,
      employees,
      taskDescription,
      deadline,
    } = req.body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!grievanceId) {
      return res.status(400).json({
        message: "Grievance ID is required",
      });
    }

    if (
      !Array.isArray(employees) ||
      employees.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one employee must be selected",
      });
    }

    // --------------------------------------------------
    // FIND GRIEVANCE
    // --------------------------------------------------

    const grievance =
      await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // --------------------------------------------------
    // CHECK OFFICER
    // --------------------------------------------------

    if (
      grievance.assignedOfficer?.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to assign this grievance",
      });
    }

    // --------------------------------------------------
    // GET OFFICER
    // --------------------------------------------------

    const officer = await User.findById(
      req.user.userId
    );

    if (!officer) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    // --------------------------------------------------
    // VERIFY EMPLOYEES
    // --------------------------------------------------

    const selectedEmployees =
      await User.find({
        _id: { $in: employees },
        role: "employee",
        departmentId: officer.departmentId,
        officerId: officer._id,
        isActive: true,
      });

    if (
      selectedEmployees.length !==
      employees.length
    ) {
      return res.status(400).json({
        message:
          "One or more selected employees are not working under this officer",
      });
    }

    // --------------------------------------------------
    // CREATE TASKS
    // --------------------------------------------------

    const tasks = [];

    for (const employee of selectedEmployees) {
      const task = await Task.create({
        grievance: grievance._id,

        employee: employee._id,

        assignedBy: officer._id,

        taskDescription:
          taskDescription || grievance.description,

        status: "Assigned",

        assignedAt: new Date(),
        deadline: deadline ? new Date(deadline) : grievance.dueDate,
      });

      tasks.push(task);
    }

    // --------------------------------------------------
    // UPDATE GRIEVANCE STATUS
    // --------------------------------------------------

    grievance.status = "In Progress";

    await grievance.save();
    await addHistory(grievance, "Employee Assigned", req.user, `Assigned ${selectedEmployees.length} employee task(s).`);
    await Promise.all(selectedEmployees.map((employee) => notify(employee._id, grievance, "TASK_ASSIGNED", `A new task was assigned for ${grievance.grievanceId}.`)));

    // --------------------------------------------------
    // POPULATE TASK DETAILS
    // --------------------------------------------------

    const populatedTasks =
      await Task.find({
        _id: {
          $in: tasks.map(
            (task) => task._id
          ),
        },
      })
        .populate(
          "employee",
          "name email phone"
        )
        .populate(
          "assignedBy",
          "name email phone"
        );

    res.status(201).json({
      message:
        "Task assigned successfully",

      count: populatedTasks.length,

      tasks: populatedTasks,
    });
  } catch (error) {
    console.error(
      "Assign tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while assigning tasks",
    });
  }
};

// ======================================================
// GET TASKS ASSIGNED TO LOGGED-IN EMPLOYEE
// ======================================================

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      employee: req.user.userId,
    })
      .populate(
        "grievance",
        "grievanceId title description category priority status dueDate location"
      )
      .populate(
        "assignedBy",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get employee tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching tasks",
    });
  }
};

// ======================================================
// UPDATE EMPLOYEE TASK STATUS
// ======================================================

const updateTaskStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      remarks,
      evidence,
    } = req.body;

    const allowedStatuses = [
      "Accepted",
      "In Progress",
      "On Hold",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid task status",
      });
    }

    const task =
      await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // --------------------------------------------------
    // EMPLOYEE AUTHORIZATION
    // --------------------------------------------------

    if (
      task.employee.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this task",
      });
    }

    const transitions = { Assigned: ["Accepted"], Accepted: ["In Progress", "On Hold"], "In Progress": ["On Hold", "Completed"], "On Hold": ["In Progress"] };
    if (!transitions[task.status]?.includes(status)) return res.status(400).json({ message: `Cannot change task from ${task.status} to ${status}` });

    // --------------------------------------------------
    // UPDATE TASK
    // --------------------------------------------------

    task.status = status;

    if (remarks !== undefined) {
      task.remarks = remarks.trim();
    }

    if (Array.isArray(evidence)) {
      task.evidence = evidence;
    }

    if (status === "Accepted") {
      task.acceptedAt = new Date();
    }

    if (status === "Completed") {
      task.completedAt = new Date();
    }

    await task.save();
    const grievance = await Grievance.findById(task.grievance);
    await addHistory(grievance, `Task ${status}`, req.user, remarks || "");
    await notify(task.assignedBy, grievance, status === "Completed" ? "TASK_COMPLETED" : "STATUS_CHANGED", `Task for ${grievance.grievanceId} is ${status}.`);

    res.status(200).json({
      message:
        "Task updated successfully",

      task,
    });
  } catch (error) {
    console.error(
      "Update task status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating task",
    });
  }
};

// ======================================================
// GET ALL TASKS FOR A GRIEVANCE
// OFFICER VIEW
// ======================================================

const getGrievanceTasks = async (
  req,
  res
) => {
  try {
    const grievance =
      await Grievance.findById(
        req.params.grievanceId
      );

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // --------------------------------------------------
    // OFFICER AUTHORIZATION
    // --------------------------------------------------

    if (
      grievance.assignedOfficer?.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view these tasks",
      });
    }

    const tasks =
      await Task.find({
        grievance: grievance._id,
      })
        .populate(
          "employee",
          "name email phone"
        )
        .populate(
          "assignedBy",
          "name email phone"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get grievance tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching grievance tasks",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  assignTasks,
  getMyTasks,
  updateTaskStatus,
  getGrievanceTasks,
};
