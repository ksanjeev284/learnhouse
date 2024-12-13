import { default as React } from 'react'
import dynamic from 'next/dynamic'
import { getCourseMetadata } from '@services/courses/courses'
import { Metadata } from 'next'
import { getActivityWithAuthHeader } from '@services/courses/activities'
import { getOrganizationContextInfoWithId } from '@services/organizations/orgs'
import EditorOptionsProvider from '@components/Contexts/Editor/EditorContext'
import AIEditorProvider from '@components/Contexts/AI/AIEditorContext'
import { nextAuthOptions } from 'app/auth/options'
import { getServerSession } from 'next-auth'
const EditorWrapper = dynamic(() => import('@components/Objects/Editor/EditorWrapper'), { ssr: false })


type MetadataProps = {
  params: { orgslug: string; courseid: string; activityid: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const session = await getServerSession(nextAuthOptions)
  const access_token = session?.tokens?.access_token
  // Get Org context information
  const course_meta = await getCourseMetadata(
    params.courseid,
    { revalidate: 0, tags: ['courses'] },
    access_token ? access_token : null
  )

  return {
    title: `Edit - ${course_meta.name} Activity`,
    description: course_meta.mini_description,
  }
}

const EditActivity = async (params: any) => {
  const session = await getServerSession(nextAuthOptions)
  const access_token = session?.tokens?.access_token
  const activityuuid = params.params.activityuuid
  const courseid = params.params.courseid
  const courseInfo = await getCourseMetadata(
    courseid,
    { revalidate: 0, tags: ['courses'] },
    access_token ? access_token : null
  )
  const activity = await getActivityWithAuthHeader(
    activityuuid,
    { revalidate: 0, tags: ['activities'] },
    access_token ? access_token : null
  )
  
  const org = await getOrganizationContextInfoWithId(courseInfo.org_id, {
    revalidate: 180,
    tags: ['organizations'],
  }, access_token)

  return (
    <EditorOptionsProvider options={{ isEditable: true }}>
      <AIEditorProvider>
        <EditorWrapper
          org={org}
          course={courseInfo}
          activity={activity}
          content={activity.content}
        ></EditorWrapper>
      </AIEditorProvider>
    </EditorOptionsProvider>
  )
}

export default EditActivity
