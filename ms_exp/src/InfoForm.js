import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const MODALITIES = [
  {
    id: 'touch',
    url: process.env.PUBLIC_URL + '/token/touch_token.PNG',
    color: '#FF4000',
  },
  {
    id: 'pen',
    url: process.env.PUBLIC_URL + '/token/pen_token.PNG',
    color: '#FFFF00',
  },
  {
    id: 'mouse',
    url: process.env.PUBLIC_URL + '/token/mouse_token.PNG',
    color: '#00CCCC',
  },
  {
    id: 'trackpad',
    url: process.env.PUBLIC_URL + '/token/trackpad_token.PNG',
    color: '#FF00FF',
  },
];

function preload(url) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', reject);
    image.src = url;
    return image;
  });
}

const InfoForm = ({ onSubmit, resumeFlag, setResumeFlag, participantIds }) => {
  // We could leave the input uncontrolled, but it is easier this way.
  const [inputValue, setInputValue] = React.useState('');
  React.useEffect(() => {
    MODALITIES.forEach((img) => {
      img.elm = preload(img.url);
    });
  }, []);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if ('currentStage' in localStorage) {
      let state = JSON.parse(localStorage.getItem('currentStage'));

      if (state.participantId === inputValue) {
        onSubmit(inputValue);
      } else {
        alert(
          'This participant ID does not match the saved ID. Please enter ' +
            'the correct participant ID, or hit the "Restart" button to delete ' +
            'all experiment progress.',
        );
      }
    } else {
      if (participantIds.indexOf(inputValue) > -1) {
        onSubmit(inputValue);
      } else {
        alert(
          'This is not a valid participant ID. ' +
            'Please make sure you typed in your provided participant ID correctly.',
        );
      }
    }
  };

  function reset() {
    if (
      window.confirm(
        'WARNING: You are deleting all experiment progress.' +
          ' Are you sure you want to do this?',
      )
    ) {
      localStorage.removeItem('currentStage');
      setResumeFlag(false);
    }
  }

  return (
    <div className="ml-4">
      <Container fluid>
        <p></p>
        <div>
          {resumeFlag ? <ResumeText /> : <DefaultText />}
          <Form inline onSubmit={handleSubmit}>
            <p>
              <Form.Label className="my-1 mr-2" style={{ fontSize: 'larger' }}>
                Participant ID:
                <Form.Control
                  style={{ marginLeft: '0.5em' }}
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="my-1 mr-2"
                />
              </Form.Label>
            </p>
            <p>
              <Button
                className="my-1 mr-2"
                type="submit"
                variant="outline-success"
              >
                Submit
              </Button>
            </p>
          </Form>
          <p></p>
          <p></p>
          <p>
            <button onClick={reset}>Restart</button>
          </p>
        </div>
      </Container>
    </div>
  );
};

InfoForm.propTypes = { onSubmit: PropTypes.func.isRequired };

function DefaultText() {
  return (
    <div style={{ fontSize: 'larger' }}>
      <p></p>
      <p></p>
      <h1>Mode Switching Experiment</h1>
      <p></p>
      <p>
        In this experiment, you will performing a simple drag and drop task,
        where you drag a circular token to a target area, while switching
        between the following four input devices:{' '}
      </p>
      <ul>
        {MODALITIES.map(({ id, color }) => (
          <li key={id}>
            <span
              style={{
                backgroundColor: 'black',
                color,
                textTransform: 'capitalize',
              }}
            >
              {id}
            </span>{' '}
          </li>
        ))}
      </ul>
      <p>Tokens are color coded to show which device you should use:</p>
      <Container fluid>
        <Row>
          {MODALITIES.map(({ id, url, color, elm }) => (
            <Col key={id}>
              <p>
                <span
                  style={{
                    backgroundColor: 'black',
                    color,
                    textTransform: 'capitalize',
                  }}
                >
                  {id}
                </span>{' '}
                tokens look like this:
              </p>

              <img src={url} width="100px" alt={`${id} token`} />
              <p></p>
            </Col>
          ))}
        </Row>
      </Container>
      <hr />
      <p></p>
      <h2>Task:</h2>
      <p></p>
      <p>
        To drag the token, tap on it with the correct device (as indicated by
        the token color). Then, drag the token to the circular target area. This
        target area has dashed lines, and is the same color as the token. You
        can tell when the token is correctly in the target area when the token
        changes color. Lift the device to release the token.
      </p>
      <p>
        After dragging the token to the target, the center target will be
        enabled, with the same color as the token. Simply tap the center target
        with the same device you used to drag the token to complete the trial!
      </p>
      <p></p>
      <p>See the task in action in the video below:</p>
      <video controls loop muted>
        <source
          src={process.env.PUBLIC_URL + '/videos/taskVid.mp4'}
          type="video/mp4"
        ></source>
      </video>
      <p></p>
      <p></p>
      <h4>Errors:</h4>
      <p></p>
      <p>
        If you do not successfully put the token on the target, or if you
        attempt to hit a token with the wrong device (for example, if you try to
        move a touch token with the pen), the screen will briefly flash red.
      </p>
      <p>After the screen flashes red, you can continue the task.</p>
      <p>See what an error looks like in the video below:</p>
      <video controls loop muted>
        <source
          src={process.env.PUBLIC_URL + '/videos/errorVid.mp4'}
          type="video/mp4"
        ></source>
      </video>
      <hr />
      <p></p>
      <h3>Experiment Structure:</h3>
      <p></p>
      <p>
        You will complete 6 pairs of device switches, with four blocks for each
        pair. Before and after the switching task, you will perform two
        &quot;baseline&quot; blocks with the devices used for the switching
        task. There are 14 trials in a device switching block, and 7 trials in a
        &quot;baseline&quot; block.
      </p>
      <p>
        As an example, for the Pen & Touch task, you would complete the
        following blocks:
      </p>
      <p>
        &emsp;Pen Baseline - <b>Block 1</b>; Touch Baseline - <b>Block 1</b>;
        Pen & Touch - <b>Block 1</b>; Pen & Touch - <b>Block 2</b>; Pen & Touch
        - <b>Block 3</b>; Pen & Touch -<b>Block 4</b>; Touch Baseline -{' '}
        <b>Block 2</b>; Pen Baseline - <b>Block 2</b>;
      </p>
      <p></p>
      <p>
        You can view your overall progress in the experiment before and after
        completing a block.
      </p>
      <hr />
      <p></p>
      <p>
        Please enter the participant ID provided to you, and hit
        &quot;Submit&quot; to begin the experiment:
      </p>
    </div>
  );
}

function ResumeText() {
  return (
    <div style={{ fontSize: 'larger' }}>
      <p></p>
      <p>You may have accidentally refreshed the web page.</p>
      <p>
        To resume the experiment from where you left off, enter your participant
        ID below!{' '}
      </p>
    </div>
  );
}

InfoForm.propTypes = { onSubmit: PropTypes.func.isRequired };

export default InfoForm;
