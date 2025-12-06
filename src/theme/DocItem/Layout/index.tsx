import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type {WrapperProps} from '@docusaurus/types';
import PersonalizeButton from '../../../components/Personalization/PersonalizeButton';
import UrduTranslate from '../../../components/UrduTranslate';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  // Extract metadata from props
  const metadata = (props as any)?.children?.type?.metadata || {};
  const chapterId = metadata.id || 'unknown';
  const chapterTitle = metadata.title || 'Chapter';

  return (
    <>
      {/* Add buttons at the top of the chapter */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        position: 'sticky',
        top: '60px',
        zIndex: 100,
        backgroundColor: 'var(--ifm-background-color)',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
      }}>
        <PersonalizeButton />
        <UrduTranslate
          chapterId={chapterId}
          chapterTitle={chapterTitle}
        />
      </div>

      {/* Render the original layout */}
      <Layout {...props} />
    </>
  );
}
