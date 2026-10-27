const Feedback = require("../models/Feedback");
const Grievance = require("../models/Grievance");
const { addHistory, notify } = require("../services/workflowService");

/**
 * Submit citizen feedback for a resolved or closed grievance.
 */
const createFeedback = async (req, res) => {
  try {
    const { grievanceId, rating, comment = "" } = req.body;

    // 1. Validation
    if (!grievanceId) {
      return res.status(400).json({ message: "Grievance ID is required" });
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }

    const trimmedComment = String(comment || "").trim().slice(0, 1000);

    // 2. Find grievance
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // 3. Authorization: Only the citizen who submitted the grievance can leave feedback
    if (grievance.citizen.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to submit feedback for this grievance" });
    }

    // 4. Status Check: Grievance must be Resolved or Closed
    if (!["Resolved", "Closed"].includes(grievance.status)) {
      return res.status(400).json({ message: "Feedback can only be submitted after the grievance is resolved" });
    }

    // 5. Prevent Duplicate Submissions
    const existingFeedback = await Feedback.findOne({ grievance: grievance._id });
    if (existingFeedback || (grievance.feedback && grievance.feedback.rating)) {
      return res.status(409).json({ message: "Feedback has already been submitted for this grievance" });
    }

    // 6. Create feedback record associated with citizen, grievance, and assigned officer
    const feedback = await Feedback.create({
      grievance: grievance._id,
      citizen: req.user.userId,
      officer: grievance.assignedOfficer || null,
      rating: numRating,
      comment: trimmedComment,
    });

    // 7. Embed feedback summary in Grievance document
    grievance.feedback = {
      rating: numRating,
      comment: trimmedComment,
      submittedAt: new Date(),
    };
    await grievance.save();

    // 8. Audit trail & Officer Notification
    await addHistory(
      grievance,
      "Citizen Feedback Submitted",
      req.user,
      `Citizen rated resolution: ${numRating}/5 Stars.${trimmedComment ? ` Remarks: "${trimmedComment}"` : ""}`
    );

    if (grievance.assignedOfficer) {
      await notify(
        grievance.assignedOfficer,
        grievance,
        "STATUS_CHANGED",
        `Citizen submitted ${numRating}-star resolution feedback for ${grievance.grievanceId}.`
      );
    }

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
      grievanceFeedback: grievance.feedback,
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({ message: "Server error while submitting feedback: " + error.message });
  }
};

/**
 * Get feedback for a grievance (accessible to authorized citizen, officer, or higher official).
 */
const getFeedbackByGrievance = async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const feedback = await Feedback.findOne({ grievance: grievanceId })
      .populate("citizen", "name email phone")
      .populate("officer", "name email designation")
      .lean();

    if (!feedback) {
      return res.status(404).json({ message: "No feedback found for this grievance" });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ message: "Server error while fetching feedback: " + error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedbackByGrievance,
};
