import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import ConsentMarkdown from './consent_letter.md';

const ConsentForm = (props) => {
  const { onSubmit } = props;

  let questions = [
    {
      label:
        'I agree to allow audio/video clips and images in which I appear to be used in teaching, scientific presentations, publication and/or datasets with the understanding that I will not be identified by name.',
      required: false,
    },
    {
      label:
        'If the audio/video clip or image is used where my face, voice, or other identifying features are recognizable, please alter the tone and pitch of the audio and/or obscuring my identity in the video or images.',
      required: false,
    },
    {
      label:
        'I agree of my own free will to participate in the study. **REQUIRED**',
      required: true,
    },
  ];

  let initialState = {
    'I agree to allow audio/video clips and images in which I appear to be used in teaching, scientific presentations, publication and/or datasets with the understanding that I will not be identified by name.': false,
    'If the audio/video clip or image is used where my face, voice, or other identifying features are recognizable, please alter the tone and pitch of the audio and/or obscuring my identity in the video or images.': false,
    'I agree of my own free will to participate in the study.': false,
  };

  const [questionsChecked, setChecked] = useState(initialState);
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    let isCanceled = false;

    fetch(ConsentMarkdown)
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        if (!isCanceled) {
          setMarkdown(data);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("couldn't load consent form!");
      });

    return () => {
      isCanceled = true;
    };
  }, []);

  const handleChange = (event) => {
    setChecked({
      ...questionsChecked,
      [event.target.id]: event.target.checked,
    });
  };

  function requiredFieldNotFilled() {
    let requiredNotFilled = questions.map((question) =>
      question.required ? !questionsChecked[question.label] : true,
    );

    return !requiredNotFilled.some((val) => !val);
  }

  function handleClick() {
    if (!requiredFieldNotFilled()) {
      onSubmit();
    } else {
      alert('You must check the required checkboxes to proceed.');
    }
  }

  return (
    <div className="ml-4" style={{ fontSize: 'larger' }}>
      <Container fluid>
        <ReactMarkdown source={markdown} />

        <hr />

        <Form>
          {questions.map((question) => {
            return (
              <div key={question.label}>
                <Form.Check
                  id={question.label}
                  type="checkbox"
                  label={question.label}
                  required={question.required}
                  onChange={handleChange}
                />
                <p></p>
              </div>
            );
          })}

          <Button onClick={handleClick} variant="outline-success">
            I Agree
          </Button>
        </Form>
      </Container>
      <p></p>
      <p></p>
      <p></p>
    </div>
  );
};

export default ConsentForm;
