const Section = require("../models/Section");
const Course = require("../models/Course");

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
    return res.status(200).json({
       success:true,
       message:"Section created successfully",
       updatedCourse,
    })
  } catch (error) {
   return res.status(500).json({
      success:false,
      message:"unable to create section, please try again",
      error:error.message,
   })
  }
};

exports.updateSection = async(req, res) => {
   try {
      //data input
      const {sectionName, sectionId} =req.body;
      //data validation
      if (!sectionName || !sectionId) {
         return res.status(400).json({
           success: false,
           message: "All fields are required",
         });
       }
      //update data
      const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});
      //return response
      return res.status(200).json({
         success:true,
         message:"Section updated successfully",
      })
      
   } catch (error) {
      return res.status(500).json({
         success:false,
         message:"unable to update section, please try again",
         error:error.message,
      })
   }
}


exports.deleteSection = async(req,res) => {
   try {
      //get id - assuming that we are sending id in params
      const {sectionId} = req.body;
      //use findByIdAndDelete
      console.log(sectionId)
      await Section.findByIdAndDelete(sectionId);
      //TODO: [Testing] do we need to delete the entry from the course schema?
      //return response
      return res.status(200).json({
         success:true,
         message:"Section deleted successfully",
      })
   } catch (error) {
      return res.status(500).json({
         success:false,
         message:"unable to delete section, please try again",
         error:error.message,
      })
   }
}
