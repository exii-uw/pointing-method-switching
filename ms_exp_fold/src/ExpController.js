import React, { useState, useEffect, useReducer } from 'react';
import InfoForm from './InfoForm';
import InstructionsPage from './InstructionsPage';
import ErrorPage from './ErrorPage';
import TaskController from './TaskController';
import Loading from './Loading';
import ExpDone from './ExpDone';
import ConsentForm from './ConsentForm';
import GoogleFormSurvey from './GoogleFormSurvey';

const DEFAULT_STATE = {
  timeline: null,
  timelineIndex: -1,
  stage: ['loading'],
  error: null,
};

const surveySources = {
  mousepen: '1FAIpQLScegUJbcWcXTHmQbs-zpSnvBEchzA3lsMXrymLFQl-GLVRx0Q',
  mousetouch: '1FAIpQLSf3XsgE9CntwycdnK8X2spHbMaBMxDISGWf_f9nbOsdHdTs6g',
  mousetrackpad: '1FAIpQLSdaoSSXSxNoMJx4ELI-LxO51pQmSg5UTHx_ZW7lDX22RRZJkw',
  pentouch: '1FAIpQLSefgu1ibbNW1doN3IXpxXPUwoUTs0k-zCo7kN_RHyQpd632Ug',
  trackpadpen: '1FAIpQLSeACyRwN_JYiaPtNneRDQhpDntQA-cl6VEnw2vb9LVAScyfEg',
  trackpadtouch: '1FAIpQLSexUo29SwFHMFlnV2Jiwexm-8ih7zl9-9AQj-3d9cxROPagvQ',
  end: '1FAIpQLSdLcq9uL8zUYX0l-Fjm90VyHbsX3MnO0TO3yA2hPXMJIKWajQ',
};

const surveyPrefills = {
  mousepen: 'entry.34462903',
  mousetouch: 'entry.34462903',
  mousetrackpad: 'entry.34462903',
  pentouch: 'entry.34462903',
  trackpadpen: 'entry.34462903',
  trackpadtouch: 'entry.34462903',
  end: 'entry.36882092',
};

function ExpController() {
  const [
    { stage, participantNumber, timelineIndex, timeline, error, taskIndex },
    dispatch,
  ] = useReducer(reducer, DEFAULT_STATE);
  const [expLog, setExpLog] = useState({});
  const [blockLog, setBlockLog] = useState([]);
  const [resumeFlag, setResumeFlag] = useState(false);
  const [resumeState, setResumeState] = useState({});
  const [fileUploadError, setUploadError] = useState(false);
  const [numOfTasks, setNumOfTasks] = useState(0);
  //const [taskIndex, setTaskIndex] = useState(0);
  //const [firstInstruction, setFirstInst] = useState(false);
  const [participantIds, setParticipantIds] = useState([]);

  useEffect(() => {
    let isCanceled = false;

    fetch('timelines.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // Dispatching if the component is gone will trigger a React warning.
        if (!isCanceled) {
          dispatch({ type: 'dataReceived', data });
          setParticipantIds(Object.keys(data));
        }
      })
      .catch((error) => {
        if (!isCanceled) {
          dispatch({ type: 'error', error });
        }
      });
    return () => {
      isCanceled = true;
    };
  }, []);

  useEffect(() => {
    if ('currentStage' in localStorage) {
      setResumeState(JSON.parse(localStorage.getItem('currentStage')));
      setResumeFlag(true);
    }
  }, []);

  useEffect(() => {
    if (timelineIndex >= 0) {
      localStorage.setItem(
        'currentStage',
        JSON.stringify({
          participantId: participantNumber,
          stage: timeline[timelineIndex],
          timelineIndex: timelineIndex,
          taskIndex: taskIndex,
        }),
      );
    }
  }, [timelineIndex, participantNumber, timeline, taskIndex]);

  function beginOrResume(participantId) {
    if (resumeFlag) {
      dispatch({ type: 'start', participantId, setNumOfTasks });
      let tl = resumeState.timelineIndex;
      let pID = participantId;
      let st = resumeState.stage;
      //setTaskIndex(resumeState.taskIndex);
      dispatch({ type: 'goToIndex', tl, pID, st });
    } else {
      dispatch({ type: 'start', participantId, setNumOfTasks });
      //setTaskIndex(0);
    }
  }

  return (
    (stage['stage'] === 'loading' && <Loading />) ||
    (stage['stage'] === 'consent' && (
      <ConsentForm
        onSubmit={() => {
          dispatch({ type: 'next' });
        }}
      />
    )) ||
    (stage['stage'] === 'info' && (
      // I don't like to share dispatch. No one needs to know how this component
      // deals with its reducer. I am using a callback instead.
      <InfoForm
        onSubmit={beginOrResume}
        resumeFlag={resumeFlag}
        setResumeFlag={setResumeFlag}
        participantIds={participantIds}
      />
    )) ||
    ((stage['stage'] === 'task' || stage['stage'] === 'baseline') && (
      <div>
        <TaskController
          dispatch={dispatch}
          stage={stage}
          timeline={timeline}
          timelineIndex={timelineIndex}
          pNo={participantNumber}
          expLog={expLog}
          setExpLog={setExpLog}
          blockLog={blockLog}
          setBlockLog={setBlockLog}
          fileUploadError={fileUploadError}
          setUploadError={setUploadError}
          numOfTasks={numOfTasks}
        />
      </div>
    )) ||
    (stage['stage'] === 'instruction' && (
      <InstructionsPage
        dispatch={dispatch}
        stage={stage}
        timelineIndex={timelineIndex}
        numOfTasks={numOfTasks}
      />
    )) ||
    (stage['stage'] === 'error' && (
      <ErrorPage pNo={participantNumber} blockLog={blockLog} error={error} />
    )) ||
    (stage['stage'] === 'survey' && (
      <GoogleFormSurvey
        pNo={participantNumber}
        dispatch={dispatch}
        prefillParticipant={surveyPrefills[stage['conds']]}
        formId={surveySources[stage['conds']]}
      />
    )) ||
    (stage['stage'] === 'done' && (
      <ExpDone fileUploadError={fileUploadError} pNo={participantNumber} />
    ))
    //<DataLogger />
  );
}

function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived':
      return { ...state, data: action.data, stage: { stage: 'info' } };
    case 'start':
      try {
        if (state.data == null) {
          throw new Error(`Data has not been received yet`);
        }
        let timeline = makeTimeline(
          state.data,
          action.participantId,
          action.setNumOfTasks,
        );
        return {
          ...state,
          // Start at 1 since 0 should already be done (it is required to get
          // the timeline itself).
          participantNumber: action.participantId,
          timelineIndex: 1,
          timeline,
          stage: timeline[1],
        };
      } catch (error) {
        return reducer(state, { type: 'error', error });
      }
    case 'goToIndex':
      return {
        ...state,
        participantNumber: action.pID,
        timelineIndex: action.tl,
        stage: action.st,
      };
    case 'next':
      if (state.timeline == null) {
        return reducer(state, {
          type: 'error',
          error: new Error(`Timeline has not started yet`),
        });
      }
      return {
        ...state,
        timelineIndex: state.timelineIndex + 1,
        stage: state.timeline[state.timelineIndex + 1],
      };
    case 'error':
      return { ...state, stage: ['error'], error: action.error };
    default:
      return reducer(state, {
        type: 'error',
        error: new Error(`Unknown action type: ${action.type}`),
      });
  }
}

function makeTimeline(data, participantId, setNumOfTasks) {
  if (participantId in data) {
    // let tempNum = 0;
    // for (let i = 0; i < data[participantId].length; i++) {
    //   if (
    //     data[participantId][i]['stage'] === 'baseline' ||
    //     data[participantId][i]['stage'] === 'task'
    //   ) {
    //     if (
    //       i > 0 &&
    //       data[participantId][i]['stage'] !==
    //         data[participantId][i - 1]['stage']
    //     ) {
    //       tempNum++;
    //     }
    //   }
    // }
    // setNumOfTasks(tempNum);
    setNumOfTasks(data[participantId].length);
    return data[participantId];
  } else {
    throw new Error(
      `Cannot create timeline, participant id not found: ${participantId}`,
    );
  }
}

export default ExpController;
