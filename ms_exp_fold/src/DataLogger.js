import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

const DataLogger = (props) => {
  const { uploadWorked, timelineIndex, numOfTasks, onSubmit } = props;
  const completion = Math.round((timelineIndex / numOfTasks) * 100);

  const successText = (
    <div className="text-center">
      <p>Your experiment log was successfully uploaded! </p>
      <p></p>
      <p>
        You have completed <b>{completion}%</b> of the experiment.
      </p>
      <p></p>
      <p>You are free to take a break and rest at this point.</p>
      <p></p>
      <p>
        When you are ready, press &quot;Continue&quot; to continue the
        experiment.
      </p>
      <p></p>
      <Button onClick={handleClick} variant="outline-success">
        Continue
      </Button>
    </div>
  );

  const failureText = (
    <div className="text-center">
      <p>
        Your experiment log did not upload properly. Don&apos;t worry! Once the
        experiment is over, you will download and email your experiment data to
        the experimenters.
      </p>
      <p>You have completed {completion}% of the experiment.</p>
      <p></p>
      <p>You are free to take a break at this point.</p>
      <p></p>
      <p>
        When you are ready, press &quot;Continue&quot; to continue the
        experiment.
      </p>
      <p></p>
      <Button onClick={handleClick} variant="outline-success">
        Continue
      </Button>
    </div>
  );

  const inProgress = (
    <div className="text-center">
      <p></p>
      <p></p>
      <Spinner animation="border" />
      <p></p>
      Uploading log of your input events recorded in this experiment task
      webpage. This could take 5 to 30 seconds depending on your connection.
      <p></p>
    </div>
  );

  function handleClick() {
    onSubmit();
  }

  function UploadStatus() {
    if (uploadWorked === 'true') {
      return <div>{successText}</div>;
    } else if (uploadWorked === 'not_complete') {
      return <div>{inProgress}</div>;
    } else {
      return <div>{failureText}</div>;
    }
  }

  return (
    <Container>
      <div style={{ fontSize: 'larger' }}>
        <UploadStatus />
      </div>
    </Container>
  );
};

export default DataLogger;
