function WordStats({ parserName, falsePositiveCount, falseNegativeCount }) {
  return (
    <fieldset id="stats-fieldset">
      <legend id="stats-legend">
        <b>
          <i>Statistics for {parserName}</i>
        </b>
      </legend>
      <div>
        <span>
          <b>False Positives:</b> {falsePositiveCount}{" "}
        </span>
        <span>
          <b>False Negatives:</b> {falseNegativeCount}
        </span>
      </div>
      <b>Total Incorrect:</b> {falsePositiveCount + falseNegativeCount}
    </fieldset>
  );
}

export default WordStats;
