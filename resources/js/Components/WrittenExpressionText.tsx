import React from "react";

interface WrittenExpressionTextProps {
  text: string;
}

export const WrittenExpressionText: React.FC<WrittenExpressionTextProps> = ({
  text,
}) => {
  const renderMarker = (letter: string, key: string) => (
    <span
      key={key}
      className="inline-flex items-center ml-1 mr-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-none shadow-xs align-middle"
    >
      ({letter})
    </span>
  );

  const renderParenthesizedOptions = () => {
    const renderedElements: React.ReactNode[] = [];
    const markerPattern = /\(([A-D])\)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    let markerIndex = 0;

    while ((match = markerPattern.exec(text)) !== null) {
      const beforeMarker = text.slice(cursor, match.index);
      const targetMatch = beforeMarker.match(/(\S+)(\s*)$/);

      if (targetMatch && targetMatch.index !== undefined) {
        const targetStart = targetMatch.index;
        renderedElements.push(
          <React.Fragment key={`segment-${markerIndex}`}>
            {beforeMarker.slice(0, targetStart)}
            <span className="font-extrabold text-slate-950 underline decoration-2 underline-offset-2">
              {targetMatch[1]}
            </span>
            {targetMatch[2]}
          </React.Fragment>
        );
      } else {
        renderedElements.push(
          <React.Fragment key={`segment-${markerIndex}`}>
            {beforeMarker}
          </React.Fragment>
        );
      }

      renderedElements.push(renderMarker(match[1], `marker-${markerIndex}`));
      cursor = match.index + match[0].length;
      markerIndex += 1;
    }

    renderedElements.push(
      <React.Fragment key="remaining-text">{text.slice(cursor)}</React.Fragment>
    );

    return renderedElements;
  };

  const renderBraceOptions = () => {
    const parts = text.split(/(\{([A-D]):([^}]+)\})/g);
    const renderedElements: React.ReactNode[] = [];

    const markerPattern = /\{([A-D]):([^}]+)\}/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    let markerIndex = 0;
    while ((match = markerPattern.exec(text)) !== null) {
      renderedElements.push(<React.Fragment key={`brace-text-${markerIndex}`}>{text.slice(cursor, match.index)}</React.Fragment>);
      renderedElements.push(
        <React.Fragment key={`brace-${match[1]}-${markerIndex}`}>
          <span className="font-extrabold text-slate-950 underline decoration-2 underline-offset-2">{match[2]}</span>
          {renderMarker(match[1], `brace-marker-${markerIndex}`)}
        </React.Fragment>
      );
      cursor = match.index + match[0].length;
      markerIndex += 1;
    }
    renderedElements.push(<React.Fragment key="brace-tail">{text.slice(cursor)}</React.Fragment>);

    return renderedElements;
  };

  const renderedElements = /\{[A-D]:[^}]+\}/.test(text)
    ? renderBraceOptions()
    : renderParenthesizedOptions();

  return (
    <div className="text-lg leading-loose font-serif tracking-normal text-slate-900 bg-slate-50/70 p-5 rounded-xl border border-slate-200 shadow-xs select-none">
      {renderedElements}
    </div>
  );
};
