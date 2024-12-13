'use client'
import Link from 'next/link'
import { getAPIUrl, getUriWithOrg } from '@services/config/config'
import Canva from '@components/Objects/Activities/DynamicCanva/DynamicCanva'
import VideoActivity from '@components/Objects/Activities/Video/Video'
import { BookOpenCheck, Check, CheckCircle, MoreVertical, UserRoundPen } from 'lucide-react'
import { markActivityAsComplete } from '@services/courses/activity'
import DocumentPdfActivity from '@components/Objects/Activities/DocumentPdf/DocumentPdf'
import ActivityIndicators from '@components/Pages/Courses/ActivityIndicators'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { usePathname, useRouter } from 'next/navigation'
import AuthenticatedClientElement from '@components/Security/AuthenticatedClientElement'
import { getCourseThumbnailMediaDirectory } from '@services/media/media'
import { useOrg } from '@components/Contexts/OrgContext'
import { CourseProvider } from '@components/Contexts/CourseContext'
import AIActivityAsk from '@components/Objects/Activities/AI/AIActivityAsk'
import AIChatBotProvider from '@components/Contexts/AI/AIChatBotContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import React, { useEffect } from 'react'
import { getAssignmentFromActivityUUID, getFinalGrade, submitAssignmentForGrading } from '@services/courses/assignments'
import AssignmentStudentActivity from '@components/Objects/Activities/Assignment/AssignmentStudentActivity'
import { AssignmentProvider } from '@components/Contexts/Assignments/AssignmentContext'
import { AssignmentsTaskProvider } from '@components/Contexts/Assignments/AssignmentsTaskContext'
import AssignmentSubmissionProvider, {  useAssignmentSubmission } from '@components/Contexts/Assignments/AssignmentSubmissionContext'
import toast from 'react-hot-toast'
import { mutate } from 'swr'
import ConfirmationModal from '@components/Objects/StyledElements/ConfirmationModal/ConfirmationModal'
import { useMediaQuery } from 'usehooks-ts'
import PaidCourseActivityDisclaimer from '@components/Objects/Courses/CourseActions/PaidCourseActivityDisclaimer'

interface ActivityClientProps {
  activityid: string
  courseuuid: string
  orgslug: string
  activity: any
  course: any
}

function ActivityClient(props: ActivityClientProps) {
  const activityid = props.activityid
  const courseuuid = props.courseuuid
  const orgslug = props.orgslug
  const activity = props.activity
  const course = props.course
  const org = useOrg() as any
  const session = useLHSession() as any;
  const pathname = usePathname()
  const access_token = session?.data?.tokens?.access_token;
  const [bgColor, setBgColor] = React.useState('bg-white')
  const [assignment, setAssignment] = React.useState(null) as any;
  const [markStatusButtonActive, setMarkStatusButtonActive] = React.useState(false);
 

  function getChapterNameByActivityId(course: any, activity_id: any) {
    for (let i = 0; i < course.chapters.length; i++) {
      let chapter = course.chapters[i]
      for (let j = 0; j < chapter.activities.length; j++) {
        let activity = chapter.activities[j]
        if (activity.id === activity_id) {
          return chapter.name
        }
      }
    }
    return null // return null if no matching activity is found
  }

  async function getAssignmentUI() {
    const assignment = await getAssignmentFromActivityUUID(activity.activity_uuid, access_token)
    setAssignment(assignment.data)
  }

  useEffect(() => {
    if (activity.activity_type == 'TYPE_DYNAMIC') {
      setBgColor('bg-white nice-shadow');
    }
    else if (activity.activity_type == 'TYPE_ASSIGNMENT') {
      setMarkStatusButtonActive(false);
      setBgColor('bg-white nice-shadow');
      getAssignmentUI();
    }
    else {
      setBgColor('bg-zinc-950');
    }
  }
    , [activity, pathname])

  return (
    <>
      <CourseProvider courseuuid={course?.course_uuid}>
        <AIChatBotProvider>
          <GeneralWrapperStyled>
            <div className="space-y-4 pt-4">
              <div className="flex space-x-6">
                <div className="flex">
                  <Link
                    href={getUriWithOrg(orgslug, '') + `/course/${courseuuid}`}
                  >
                    <img
                      className="w-[100px] h-[57px] rounded-md drop-shadow-md"
                      src={`${getCourseThumbnailMediaDirectory(
                        org?.org_uuid,
                        course.course_uuid,
                        course.thumbnail_image
                      )}`}
                      alt=""
                    />
                  </Link>
                </div>
                <div className="flex flex-col -space-y-1">
                  <p className="font-bold text-gray-700 text-md">Course </p>
                  <h1 className="font-bold text-gray-950 text-2xl first-letter:uppercase">
                    {course.name}
                  </h1>
                </div>
              </div>
              <ActivityIndicators
                course_uuid={courseuuid}
                current_activity={activityid}
                orgslug={orgslug}
                course={course}
              />

              <div className="flex justify-between items-center">
                <div className="flex flex-col -space-y-1">
                  <p className="font-bold text-gray-700 text-md">
                    Chapter : {getChapterNameByActivityId(course, activity.id)}
                  </p>
                  <h1 className="font-bold text-gray-950 text-2xl first-letter:uppercase">
                    {activity.name}
                  </h1>
                </div>
                <div className="flex space-x-1 items-center">
                  {activity && activity.published == true && activity.content.paid_access != false && (
                    <AuthenticatedClientElement checkMethod="authentication">
                      {activity.activity_type != 'TYPE_ASSIGNMENT' &&
                        <>
                          <AIActivityAsk activity={activity} />
                          <MoreVertical size={17} className="text-gray-300 " />
                          <MarkStatus
                            activity={activity}
                            activityid={activityid}
                            course={course}
                            orgslug={orgslug}
                          />
                        </>
                      }
                      {activity.activity_type == 'TYPE_ASSIGNMENT' &&
                        <>
                          <MoreVertical size={17} className="text-gray-300 " />
                          <AssignmentSubmissionProvider assignment_uuid={assignment?.assignment_uuid}>
                            <AssignmentTools
                              assignment={assignment}
                              activity={activity}
                              activityid={activityid}
                              course={course}
                              orgslug={orgslug}
                            />
                          </AssignmentSubmissionProvider>
                        </>
                      }

                    </AuthenticatedClientElement>
                  )}
                </div>
              </div>
              {activity && activity.published == false && (
                <div className="p-7 drop-shadow-sm rounded-lg bg-gray-800">
                  <div className="text-white">
                    <h1 className="font-bold text-2xl">
                      This activity is not published yet
                    </h1>
                  </div>
                </div>
              )}

              {activity && activity.published == true && (
                <>
                  {activity.content.paid_access == false ? (
                    <PaidCourseActivityDisclaimer course={course} />
                  ) : (
                    <div className={`p-7 drop-shadow-sm rounded-lg ${bgColor}`}>
                      {/* Activity Types */}
                      <div>
                        {activity.activity_type == 'TYPE_DYNAMIC' && (
                          <Canva content={activity.content} activity={activity} />
                        )}
                        {activity.activity_type == 'TYPE_VIDEO' && (
                          <VideoActivity course={course} activity={activity} />
                        )}
                        {activity.activity_type == 'TYPE_DOCUMENT' && (
                          <DocumentPdfActivity
                            course={course}
                            activity={activity}
                          />
                        )}
                        {activity.activity_type == 'TYPE_ASSIGNMENT' && (
                          <div>
                            {assignment ? (
                              <AssignmentProvider assignment_uuid={assignment?.assignment_uuid}>
                                <AssignmentsTaskProvider>
                                  <AssignmentSubmissionProvider assignment_uuid={assignment?.assignment_uuid}>
                                    <AssignmentStudentActivity />
                                  </AssignmentSubmissionProvider>
                                </AssignmentsTaskProvider>
                              </AssignmentProvider>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {<div style={{ height: '100px' }}></div>}
            </div>
          </GeneralWrapperStyled>
        </AIChatBotProvider>
      </CourseProvider>
    </>
  )
}

export function MarkStatus(props: {
  activity: any
  activityid: string
  course: any
  orgslug: string
}) {
  const router = useRouter()
  const session = useLHSession() as any;
  const isMobile = useMediaQuery('(max-width: 768px)')
  async function markActivityAsCompleteFront() {
    const trail = await markActivityAsComplete(
      props.orgslug,
      props.course.course_uuid,
      'activity_' + props.activityid,
      session.data?.tokens?.access_token
    )
    router.refresh()
  }

  const isActivityCompleted = () => {
    let run = props.course.trail.runs.find(
      (run: any) => run.course_id == props.course.id
    )
    if (run) {
      return run.steps.find(
        (step: any) => (step.activity_id == props.activity.id) && (step.complete == true)
      )
    }
  }

  return (
    <>
      {isActivityCompleted() ? (
        <div className="bg-teal-600 rounded-full px-5 drop-shadow-md flex items-center space-x-2  p-2.5  text-white hover:cursor-pointer transition delay-150 duration-300 ease-in-out">
          <i>
            <Check size={17}></Check>
          </i>{' '}
          <i className="not-italic text-xs font-bold">Complete</i>
        </div>
      ) : (
        <div
          className="bg-gray-800 rounded-full px-5 drop-shadow-md flex  items-center space-x-2 p-2.5  text-white hover:cursor-pointer transition delay-150 duration-300 ease-in-out"
          onClick={markActivityAsCompleteFront}
        >
          {' '}
          <i>
            <Check size={17}></Check>
          </i>{' '}
          {!isMobile && <i className="not-italic text-xs font-bold">Mark as complete</i>}
        </div>
      )}
    </>
  )
}

function AssignmentTools(props: {
  activity: any
  activityid: string
  course: any
  orgslug: string
  assignment: any
}) {
  const submission = useAssignmentSubmission() as any
  const session = useLHSession() as any;
  const [finalGrade, setFinalGrade] = React.useState(null) as any;

  const submitForGradingUI = async () => {
    if (props.assignment) {
      const res = await submitAssignmentForGrading(
        props.assignment?.assignment_uuid,
        session.data?.tokens?.access_token
      )
      if (res.success) {
        toast.success('Assignment submitted for grading')
        mutate(`${getAPIUrl()}assignments/${props.assignment?.assignment_uuid}/submissions/me`,)
      }
      else {
        toast.error('Failed to submit assignment for grading')
      }
    }
  }

  const getGradingBasedOnMethod = async () => {
    const res = await getFinalGrade(
      session.data?.user?.id,
      props.assignment?.assignment_uuid,
      session.data?.tokens?.access_token
    );

    if (res.success) {
      const { grade, max_grade, grading_type } = res.data;
      let displayGrade;

      switch (grading_type) {
        case 'ALPHABET':
          displayGrade = convertNumericToAlphabet(grade, max_grade);
          break;
        case 'NUMERIC':
          displayGrade = `${grade}/${max_grade}`;
          break;
        case 'PERCENTAGE':
          const percentage = (grade / max_grade) * 100;
          displayGrade = `${percentage.toFixed(2)}%`;
          break;
        default:
          displayGrade = 'Unknown grading type';
      }

      // Use displayGrade here, e.g., update state or display it
      setFinalGrade(displayGrade);
    } else {
    }
  };

  // Helper function to convert numeric grade to alphabet grade
  function convertNumericToAlphabet(grade: any, maxGrade: any) {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  useEffect(() => {
    if ( submission && submission.length > 0 && submission[0].submission_status === 'GRADED') {
      getGradingBasedOnMethod();
    }
  }
    , [submission, props.assignment])

  if (!submission || submission.length === 0) {
    return (
      <ConfirmationModal
        confirmationButtonText="Submit Assignment"
        confirmationMessage="Are you sure you want to submit your assignment for grading? Once submitted, you will not be able to make any changes."
        dialogTitle="Submit your assignment for grading"
        dialogTrigger={
          <div className="bg-cyan-800 rounded-full px-5 drop-shadow-md flex items-center space-x-2 p-2.5 text-white hover:cursor-pointer transition delay-150 duration-300 ease-in-out">
            <BookOpenCheck size={17} />
            <span className="text-xs font-bold">Submit for grading</span>
          </div>
        }
        functionToExecute={submitForGradingUI}
        status="info"
      />
    )
  }

  if (submission[0].submission_status === 'SUBMITTED') {
    return (
      <div className="bg-amber-800 rounded-full px-5 drop-shadow-md flex items-center space-x-2 p-2.5 text-white transition delay-150 duration-300 ease-in-out">
        <UserRoundPen size={17} />
        <span className="text-xs font-bold">Grading in progress</span>
      </div>
    )
  }

  if (submission[0].submission_status === 'GRADED') {
    return (
      <div className="bg-teal-600 rounded-full px-5 drop-shadow-md flex items-center space-x-2 p-2.5 text-white transition delay-150 duration-300 ease-in-out">
        <CheckCircle size={17} />
        <span className="text-xs flex space-x-2 font-bold items-center"><span>Graded </span> <span className='bg-white text-teal-800 px-1 py-0.5 rounded-md'>{finalGrade}</span></span>
      </div>
    )
  }

  // Default return in case none of the conditions are met
  return null
}

export default ActivityClient
