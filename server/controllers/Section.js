const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/Subsection");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section objectId
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    //return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to create section, please try again",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //data input
    const { sectionName, sectionId, courseId } = req.body;
    //data validation
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    //return response
    res.status(200).json({
      success: true,
      message: section,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to update section, please try again",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //get id - assuming that we are sending id in params
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })
    const section = await Section.findById(sectionId)
    console.log(sectionId, courseId)
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })

    await Section.findByIdAndDelete(sectionId)

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    //return response
    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to delete section, please try again",
      error: error.message,
    });
  }
};
