import { getAPIUrl } from "@services/config/config";
import { RequestBody, RequestBodyForm, RequestBodyWithAuthHeader, errorHandling } from "@services/utils/ts/requests";

/*
 This file includes only POST, PUT, DELETE requests
 GET requests are called from the frontend using SWR (https://swr.vercel.app/)
*/

export async function getOrgCourses(org_id: number, next: any) {
  const result: any = await fetch(`${getAPIUrl()}courses/org_slug/${org_id}/page/1/limit/10`, RequestBody("GET", null, next));
  const res = await errorHandling(result);
  return res;
}

export async function getOrgCoursesWithAuthHeader(org_id: number, next: any, access_token: string) {
  const result: any = await fetch(`${getAPIUrl()}courses/org_slug/${org_id}/page/1/limit/10`, RequestBodyWithAuthHeader("GET", null, next, access_token));
  const res = await errorHandling(result);
  return res;
}

export async function getCourseMetadataWithAuthHeader(course_id: any, next: any, access_token: string) {
  const result = await fetch(`${getAPIUrl()}courses/meta/course_${course_id}`, RequestBodyWithAuthHeader("GET", null, next, access_token));
  const res = await errorHandling(result);
  return res;
}

export async function updateCourse(course_id: any, data: any) {
  const result: any = await fetch(`${getAPIUrl()}courses/course_${course_id}`, RequestBody("PUT", data, null));
  const res = await errorHandling(result);
  return res;
}

export async function updateCourseThumbnail(course_id: any, newThumbnail: any) {
  // Send the new thumbnail as form data
  const formData = new FormData();
  formData.append("thumbnail", newThumbnail);

  // Update the course's thumbnail using a PUT request
  try {
    const result: any = await fetch(`${getAPIUrl()}courses/update-thumbnail/${course_id}`, RequestBodyForm("PUT", formData, null));
    const res = await errorHandling(result);
    return res;
  } catch (error) {
    console.error('Error updating course thumbnail:', error);
    throw error;
  }
}

export async function getCourse(course_id: string, next: any) {
  const result: any = await fetch(`${getAPIUrl()}courses/${course_id}`, RequestBody("GET", null, next));
  const res = await errorHandling(result);
  return res;
}

export async function createNewCourse(org_id: string, course_body: any, thumbnail: any) {
  // Send file thumbnail as form data
  const formData = new FormData();
  formData.append("thumbnail", thumbnail);
  formData.append("name", course_body.name);
  formData.append("description", course_body.description);
  formData.append("mini_description", "course_body.mini_description");
  formData.append("public", "true");

  const result = await fetch(`${getAPIUrl()}courses/?org_id=${org_id}`, RequestBodyForm("POST", formData, null));
  const res = await errorHandling(result);
  return res;
}

export async function deleteCourseFromBackend(course_id: any) {
  const result: any = await fetch(`${getAPIUrl()}courses/${course_id}`, RequestBody("DELETE", null, null));
  const res = await errorHandling(result);
  return res;
}