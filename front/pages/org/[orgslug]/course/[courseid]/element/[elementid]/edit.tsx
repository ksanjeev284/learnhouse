import { default as React, useEffect, useRef } from "react";

import Layout from "../../../../../../../components/ui/Layout";
import { Title } from "../../../../../../../components/ui/styles/Title";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getElement } from "../../../../../../../services/courses/elements";

// Workaround (Next.js SSR doesn't support tip tap editor)
const Editor: any = dynamic(() => import("../../../../../../../components/editor/Editor") as any, {
  ssr: false,
});

function EditElement() {
  const router = useRouter();
  const { elementid } = router.query;
  const [element, setElement] = React.useState<any>({});
  const [isLoading, setIsLoading] = React.useState(true);

  async function fetchElementData() {
    const element = await getElement("element_" + elementid);
    setElement(element);
    setIsLoading(false);
  }

  React.useEffect(() => {
    if (router.isReady) {
      fetchElementData();
    }
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <Layout>
      <Title>Edit : {element.name} </Title>
      <br />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Editor element={element} content={element.content}></Editor>
        </div>
      )}
    </Layout>
  );
}

export default EditElement;