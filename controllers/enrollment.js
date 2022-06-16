const Student = require("../models/student");
const catchAsync = require("../utils/catchAsync");
const Enrollment = require("../models/enrollment");
const AppError = require("../utils/appError");
const Course = require("../models/course");
const { populate } = require("../models/student");

exports.createEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = {
    course: req.Course._id,
    student: req.Student._id,
  };
  let newEnrollment = await Enrollment.findOne({
    course: req.Course._id,
    student: req.Student._id,
  });

  if (!newEnrollment) {
    newEnrollment = await Enrollment.create(enrollment);
    newEnrollment.sectionProgress = req.Course.sections.map((section) => {
      return { section: section, timeCompleted: 0.0 };
    });
    await newEnrollment.save();
    const currcourse = await Course.findById(req.Course._id);
    currcourse.enrollments.push(newEnrollment);
    currcourse.totalEnrollments = currcourse.totalEnrollments+1;
    await currcourse.save();
    const currstudent = await Student.findById(req.Student._id);
    currstudent.enrollments.push(newEnrollment);
    currstudent.messages.push("You have been enrolled in " + req.Course.name);
    await currstudent.save();
    res.status(201).json({
      status: "success",
      // jwt: token,
      data: {
        enrollment: newEnrollment,
      },
    });
  } else {
    return next(new AppError("You cannot Enroll Again in Same Course", 400));
  }
});
exports.enrollmentById = catchAsync(async (req, res, next) => {
  //console.log(req.params.courseId);
  const enrollment = await Enrollment.findById(
    req.params.enrollmentId
  ).populate([
    {
      path: "course",
      model: "Course",
      populate:{
        path:"sections",
        model:"Section",
        populate:{
          path:"lessons",
          model:"Lesson",
        }
      },
      select: "-image -enrollments",
    },
    {
      path: "student",
      model: "Student",
    },
  ]);
  // console.log(course);
  if (!enrollment) {
    return next(new AppError("Enrollment is Not Found", 401));
  }
  req.Enrollment = enrollment;
  next();
});
exports.lessonById = catchAsync(async(req, res,next)=>{
  const lesson  = await Lesson.findById(req.params.enrollmentId).populate('lesson');
  if (!lesson) {
    return next(new AppError("Enrollment is Not Found", 401));
  }
  req.Lesson = lesson;
  next();
});
exports.specificStudentEnrollments = catchAsync(async (req, res, next) => {
  page = req.query.page || 1;
  let Sort_select = req.query.sort_select;
  LIMIT = req.query.LIMIT || 4;
  const student = req.Student;
  const enrollment = await Enrollment.find({ student: student._id })
    .sort(`${Sort_select}`)
    .skip((page - 1) * LIMIT)
    .limit(LIMIT)
    .populate([
      {
        path: "course",
        model: "Course",
        populate: { path: "instructor", model: "Educator", select: "name " },
        select: "-enrollments -reviews",
      },
    ]);
  res.status(201).json({
    status: "success",
    data: {
      enrollments: enrollment,
    },
  });
});
exports.isEnrolled = catchAsync(async (req, res, next) => {
  const student = req.Student;
  const enrolled = student.enrollments.find((ele) => {
    console.log(JSON.stringify(ele._id));
    console.log(JSON.stringify(req.params.enrollmentId));
    return JSON.stringify(ele._id) === JSON.stringify(req.params.enrollmentId);
  });
  // console.log(enrolled);
  if (!enrolled) {
    return next(new AppError("Enrollment is Not Found", 401));
  }
  next();
});

exports.readEnrollment = catchAsync(async (req, res, next) => {
  res.status(201).json({
    status: "success",
    // jwt: token,
    data: {
      enrollment: req.Enrollment,
    },
  });
});

exports.updateLessonStatus = catchAsync(async (req, res, next) => {
  //console.log(req.params.courseId);
  const enrollment = await Enrollment.findById(req.params.enrollmentId);
  enrollment.lessonsProgress = enrollment.lessonsProgress.map(
    (lessonstatus) => {
      if (
        JSON.stringify(lessonstatus.lesson._id) ==
        JSON.stringify(req.params.lessonId)
      ) {
        return { lesson: lesson, complete: true };
      }
      return { lesson: lesson, complete: false };
    }
  );
  await enrollment.save();
  const message = `lesson completed`;
  const student = await Student.findByIdAndUpdate(
    req.Student._id,
    { $push: { messages: message } },
    { new: true }
  );
  await student.save();
});

exports.createNote = catchAsync(async (req, res, next) => {
    const {name,description}=req.body;
    const lesson  = req.Enrollment.course.lessons.find((lesson)=>{
       return  lesson._id === req.params._id
    })
    const note = {name:name,description:description,lesson:lesson};
    const student = await Student.findByIdAndUpdate(
        req.Student._id,
        { $push: { notes: note } },
        { new: true }
      );
    await student.save();
})

exports.editNote = catchAsync(async (req, res, next) => {
  const {name,description}=req.body;
  const lesson  = req.Enrollment.course.lessons.find((lesson)=>{
    return  lesson._id === req.params._id
 })
    const note = {name:name,description:description,lesson:lesson};
    lesson.overwrite(note);
    await lesson.save();
})
exports.isComplete = catchAsync(async (req, res, next) => {
    const complete = req.Enrollment.complete;
    if(!complete)
    {
        return next(new AppError("Course is Not completed", 401));
    }
    next();
})
exports.deleteNote = catchAsync(async (req, res, next) => {
  const lesson  = req.Enrollment.course.lessons.find((lesson)=>{
    return  lesson._id === req.params._id
 })
 const deletedNote  = await le 
})
exports.createReview = catchAsync(async (req, res, next) => {
    const {rating,review} = req.body;
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    enrollment.review=review
    enrollment.rating = rating
    await enrollment.save();
    res.send(enrollment);
}
)
exports.deleteReview = catchAsync(async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    const deletedMessage = await enrollment.deleteOne({ _id: notes._id });
    res.status(200).json({
     status: "success",
     data: {
       deletedMessage,
     },
   });
    }
    catch (err) {
      return next(new AppError("Something went wrong while Updating", 401));
      }})
exports.createMessage = catchAsync( async(req,res,next) => {
 const {messages} = req.body;
 const enrollment = await Enrollment.findById(req.params.enrollmentId);
 enrollment.messages = messages
 await enrollment.save();
 res.send(enrollment);
}
)
exports.deleteMessage = catchAsync( async(req,res,next) => {
  try {
 const enrollment = await Enrollment.findById(req.params.enrollmentId);
 const deletedMessage = await enrollment.deleteOne({ _id: notes._id });
 res.status(200).json({
  status: "success",
  data: {
    deletedMessage,
  },
});
 }
catch (err) {
return next(new AppError("Something went wrong while Updating", 401));
}})

