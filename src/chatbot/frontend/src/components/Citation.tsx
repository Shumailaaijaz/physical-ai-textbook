import React, { useState } from 'react';

interface CitationProps {
  chapter: number;
  section: string;
  url: string;
  similarityScore?: number;
  previewText?: string;
}

const Citation: React.FC<CitationProps> = ({
  chapter,
  section,
  url,
  similarityScore,
  previewText
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    // Navigate to the URL
    if (url) {
      // Try to scroll to the section
      const navigateToSection = () => {
        try {
          // Extract the anchor from the URL
          const anchor = url.split('#')[1];
          if (anchor) {
            const element = document.getElementById(anchor) || document.querySelector(`[name="${anchor}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Add temporary highlight
              element.classList.add('citation-highlight');
              setTimeout(() => {
                element.classList.remove('citation-highlight');
              }, 3000);
            } else {
              // If anchor not found, try to navigate to the chapter
              window.location.href = url.split('#')[0];
            }
          } else {
            window.location.href = url;
          }
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback: just navigate to the URL
          window.location.href = url;
        }
      };

      // If we're already on the textbook page, use history navigation
      if (window.location.pathname.includes('/docs/')) {
        navigateToSection();
      } else {
        // Otherwise, navigate to the full URL
        window.location.href = url;
      }
    }
  };

  const formatScoreColor = () => {
    if (similarityScore === undefined) return 'inherit';
    if (similarityScore >= 0.9) return 'green';
    if (similarityScore >= 0.8) return 'yellow';
    return 'red';
  };

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        style={{
          color: '#4cc9f0',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontSize: '0.9em',
          marginLeft: '0.25rem',
        }}
      >
        [Chapter {chapter}, Section {section}]
      </a>

      {showTooltip && previewText && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.8rem',
            maxWidth: '300px',
            whiteSpace: 'normal',
            zIndex: 10001,
            marginBottom: '0.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            Chapter {chapter}, Section {section}
            {similarityScore !== undefined && (
              <span style={{ color: formatScoreColor(), marginLeft: '0.5rem' }}>
                ({(similarityScore * 100).toFixed(0)}%)
              </span>
            )}
          </div>
          <div>{previewText}</div>
        </div>
      )}

      {similarityScore !== undefined && (
        <span
          style={{
            color: formatScoreColor(),
            fontSize: '0.8em',
            marginLeft: '0.25rem',
          }}
        >
          ({(similarityScore * 100).toFixed(0)}%)
        </span>
      )}
    </span>
  );
};

export default Citation;