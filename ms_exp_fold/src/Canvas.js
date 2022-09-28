import React, { useEffect, useCallback } from 'react';
import style from './Canvas.module.css';
import useCanvas from './hooks/useCanvas';
import usePreventDefault from './hooks/usePreventDefault';
import _ from 'lodash';

const PEN_COLOR = '#FFFF00';
const PEN_DRAG_COLOR = '#999900';
const PEN_HIT_COLOR = '#FFFF99';

const MOUSE_COLOR = '#00CCCC';
const MOUSE_DRAG_COLOR = '#006666';
const MOUSE_HIT_COLOR = '#66FFFF';

const TOUCH_COLOR = '#FF4000';
const TOUCH_DRAG_COLOR = '#992600';
const TOUCH_HIT_COLOR = '#ff8c66';

const TRACK_COLOR = '#FF00FF';
const TRACK_DRAG_COLOR = '#990099';
const TRACK_HIT_COLOR = '#FF99FF';

const interval = 300;
const tolerance = 0.49;
const bound = 25;

let mouseX = 0;
let mouseY = 0;

let xDiff = 0;
let yDiff = 0;

const Canvas = (props) => {
  const {
    circles,
    setCircles,
    path,
    currPathIndex,
    targetId,
    tokenId,
    advanceTrial,
    activateCenter,
    stage,
    eventList,
    setEventList,
    missCount,
    setMissCount,
    canvasY,
    numOfTasks,
    timeline,
    timelineIndex,
    ...rest
  } = props;

  const [errorFlag, setErrorFlag] = React.useState(false);
  const [mx, setMouseX] = React.useState(0);
  const [my, setMouseY] = React.useState(0);

  const totalBlocks = stage['stage'] === 'baseline' ? 2 : 8;

  let blockNum = stage['block'];

  if (stage['stage'] === 'baseline') {
    if (
      timeline[timelineIndex - 2]['stage'] === 'baseline' &&
      JSON.stringify(stage['for']) ===
        JSON.stringify(timeline[timelineIndex - 2]['for'])
    ) {
      blockNum = 2;
    } else {
      blockNum = 1;
    }
  }

  const throttledAppend = useCallback(
    _.throttle((log) => appendToEventList(log), 25),
    [],
  );

  useEffect(() => {
    if (errorFlag) {
      let timeoutId = setTimeout(clearErrorFlag, interval);
      return () => clearTimeout(timeoutId);
    }
  }, [errorFlag]);

  function clearErrorFlag() {
    setErrorFlag(false);
  }

  const appendToEventList = (event) => {
    setEventList((prevList) => [...prevList, event]);
  };

  function getFillColor(input) {
    switch (input) {
      case 'pen':
        return PEN_COLOR;
      case 'touch':
        return TOUCH_COLOR;
      case 'mouse':
        return MOUSE_COLOR;
      case 'trackpad':
        return TRACK_COLOR;
      default:
        return 'white';
    }
  }

  function getDragColor(input) {
    switch (input) {
      case 'pen':
        return PEN_DRAG_COLOR;
      case 'touch':
        return TOUCH_DRAG_COLOR;
      case 'mouse':
        return MOUSE_DRAG_COLOR;
      case 'trackpad':
        return TRACK_DRAG_COLOR;
      default:
        return 'white';
    }
  }

  function getHitColor(input) {
    switch (input) {
      case 'pen':
        return PEN_HIT_COLOR;
      case 'touch':
        return TOUCH_HIT_COLOR;
      case 'mouse':
        return MOUSE_HIT_COLOR;
      case 'trackpad':
        return TRACK_HIT_COLOR;
      default:
        return 'white';
    }
  }

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //Background is red when an error occurs
    if (!errorFlag) {
      ctx.fillStyle = '#000000';
    } else {
      ctx.fillStyle = '#EE0000';
    }

    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.font = '40px Arial';

    let textColor1 = getFillColor(stage['conds'][0]);
    let textColor2 = getFillColor(stage['conds'][1]);

    ctx.fillStyle = textColor1;
    if (stage['stage'] === 'baseline') {
      ctx.fillText(capitalize(stage['conds'][0]), 10, 40);
    } else {
      ctx.fillText(capitalize(stage['conds'][0]), 10, 40);

      ctx.fillStyle = 'white';
      ctx.fillText(', ', 175, 40);

      ctx.fillStyle = textColor2;
      ctx.fillText(capitalize(stage['conds'][1]), 195, 40);
    }

    ctx.fillStyle = 'white';
    ctx.fillText(
      'Progress: ' + Math.round((timelineIndex / numOfTasks) * 100) + '%',
      10,
      80,
    );
    ctx.fillText('Block: ' + blockNum + '/' + totalBlocks, 10, 120);

    ctx.fillText('Trial: ' + (currPathIndex + 1) + '/' + path.length, 10, 160);

    //draw targets
    for (let i = 0; i < circles.length; i++) {
      if (circles[i].dragOn) {
        //if the circle is being dragged
        circles[i].x = mouseX - xDiff;
        circles[i].y = mouseY - yDiff;

        //Code to keep the dragged token on screen (within the 'bound' parameter)
        if (circles[i].x <= bound) {
          circles[i].x = bound;
        }

        if (circles[i].x >= window.innerWidth - bound) {
          circles[i].x = window.innerWidth - bound;
        }

        if (circles[i].y <= bound) {
          circles[i].y = bound;
        }

        if (circles[i].y >= window.innerHeight - bound) {
          circles[i].y = window.innerHeight - bound;
        }

        if (
          circleHitTest(
            circles[targetId].x,
            circles[targetId].y,
            circles[i].x,
            circles[i].y,
            circles[i].r * tolerance,
          )
        ) {
          //if the dragged circle is on the target
          circles[i].fill = getHitColor(circles[i].mode);
        } else {
          //if circle is being dragged
          circles[i].fill = getDragColor(circles[i].mode);
        }
      } else if (circles[i].isTarget) {
        //Coloring the target
        if (
          circleHitTest(
            circles[i].x,
            circles[i].y,
            circles[tokenId].x,
            circles[tokenId].y,
            circles[tokenId].r * tolerance,
          )
        ) {
          //if token is docked on target
          circles[i].fill = getHitColor(circles[i].mode);
        } else if (
          circleHitTest(
            mouseX,
            mouseY,
            circles[i].x,
            circles[i].y,
            circles[i].r,
          ) &&
          circles[i].isCenter &&
          circles[i].isTarget
        ) {
          //If mouse is on the center while it is the target
          //Set the center target to the "drag" color when hit
          circles[i].fill = getDragColor(circles[i].mode);
        } else {
          //otherwise, set to default color
          circles[i].fill = getFillColor(circles[i].mode);
        }
      } else if (circles[i].isToken) {
        //set token to default color
        circles[i].fill = getFillColor(circles[i].mode);
      } else {
        //set token to "off" color
        circles[i].fill = '#333333';
      }

      if (circles[i].isVisible) {
        //only draw the circle if it is visible
        //(this only really applies to the center target)
        drawCircle(
          ctx,
          circles[i].x,
          circles[i].y,
          circles[i].r,
          circles[i].fill,
          circles[i].isTarget,
          circles[i].isCenter,
        );
      }
    }
  };

  const canvasRef = useCanvas(draw);

  const pointerHandler = (e) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);
    mouseX = e.clientX;
    mouseY = e.clientY;

    throttledAppend([
      Date.now(),
      'move',
      'null',
      e.pointerType,
      e.clientX,
      e.clientY,
      e.pressure.toFixed(2),
      e.tiltX,
      e.tiltY,
    ]);
  };

  const mouseHandler = (e) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);

    mouseX = e.clientX;
    mouseY = e.clientY;

    throttledAppend([
      Date.now(),
      'move',
      'null',
      'mouse',
      e.clientX,
      e.clientY,
      0,
      0,
      0,
    ]);
  };

  const pointerDownHandler = (e) => {
    e.preventDefault();

    // if (e.clientX < 100 && e.clientY > window.innerHeight - 110) {
    //   console.log('skip!')
    //   advanceTrial(currPathIndex, circles[tokenId].mode, [], missCount);
    // }

    if (
      typeof e.pointerType !== 'undefined' ||
      typeof e.pressure !== 'undefined'
    ) {
      appendToEventList([
        Date.now(),
        'down',
        'null',
        e.pointerType,
        e.clientX,
        e.clientY,
        e.pressure.toFixed(2),
        e.tiltX,
        e.tiltY,
      ]);
    } else {
      appendToEventList([
        Date.now(),
        'down',
        'null',
        'mouse',
        e.clientX,
        e.clientY,
        0.0,
        0,
        0,
      ]);
    }

    if (
      //If the user clicks on the token, with the correct mode
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[tokenId].x,
        circles[tokenId].y,
        circles[tokenId].r,
      ) &&
      (e.pointerType === circles[tokenId].mode ||
        (e.pointerType === 'mouse' && circles[tokenId].mode === 'trackpad') ||
        (typeof e.pointerType === 'undefined' &&
          (circles[tokenId].mode === 'trackpad' ||
            circles[tokenId].mode === 'mouse')))
    ) {
      //Calculate the offset from the pointer to the center of the token
      xDiff = e.clientX - circles[tokenId].x;
      yDiff = e.clientY - circles[tokenId].y;
      //set mouseX and mouseY state variables
      mouseX = e.clientX;
      mouseY = e.clientY;
      //The token is draggable
      setCircles(
        circles.map((circle) => {
          return {
            ...circle,
            dragOn: circle.id === tokenId,
          };
        }),
      );

      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'token',
          tokenId,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'token',
          tokenId,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }
    } else if (
      //if the user does not click on the token or the center target
      //with the wrong mode
      !circleHitTest(
        e.clientX,
        e.clientY,
        circles[tokenId].x,
        circles[tokenId].y,
        circles[tokenId].r,
      ) &&
      !circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      ) &&
      !(
        e.pointerType === circles[tokenId].mode ||
        (e.pointerType === 'mouse' && circles[tokenId].mode === 'trackpad') ||
        (typeof e.pointerType === 'undefined' &&
          (circles[tokenId].mode === 'trackpad' ||
            circles[tokenId].mode === 'mouse'))
      )
    ) {
      //console.log('pdown, wrong mode, not target');
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          'null',
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          'null',
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }
      setErrorFlag(true);
      setMissCount(missCount + 1);
    } else if (
      //if the user does not click on the token or the center target
      !circleHitTest(
        e.clientX,
        e.clientY,
        circles[tokenId].x,
        circles[tokenId].y,
        circles[tokenId].r,
      ) &&
      !circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      )
    ) {
      //console.log('pdown, not target');
      //Error is added to eventList, screen flashes, increment miss count
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'miss_down',
          'null',
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'miss_down',
          'null',
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }

      setErrorFlag(true);
      setMissCount(missCount + 1);
    } else if (
      //If the user hits the target with the wrong mode
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[tokenId].x,
        circles[tokenId].y,
        circles[tokenId].r,
      ) &&
      !(
        e.pointerType === circles[tokenId].mode ||
        (e.pointerType === 'mouse' && circles[tokenId].mode === 'trackpad') ||
        (typeof e.pointerType === 'undefined' &&
          (circles[tokenId].mode === 'trackpad' ||
            circles[tokenId].mode === 'mouse'))
      )
      // !(
      //   e.pointerType === circles[tokenId].mode ||
      //   (e.pointerType === 'mouse' && circles[tokenId].mode === 'trackpad')
      // )
    ) {
      //console.log('pdown, wrong mode');
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          'null',
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          'null',
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }
      setErrorFlag(true);
      setMissCount(missCount + 1);
    }
  };

  const pointerUpHandler = (e) => {
    e.preventDefault();
    xDiff = 0;
    yDiff = 0;

    if (
      typeof e.pointerType !== 'undefined' ||
      typeof e.pressure !== 'undefined'
    ) {
      appendToEventList([
        Date.now(),
        'up',
        'null',
        e.pointerType,
        e.clientX,
        e.clientY,
        e.pressure.toFixed(2),
        e.tiltX,
        e.tiltY,
      ]);
    } else {
      appendToEventList([
        Date.now(),
        'up',
        'null',
        'mouse',
        e.clientX,
        e.clientY,
        0.0,
        0,
        0,
      ]);
    }

    //if the token was being dragged
    if (circles[tokenId].dragOn) {
      //add to event log
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'release',
          tokenId,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'release',
          tokenId,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }
    }

    //set drag flag to false for all circles
    setCircles(
      circles.map((circle) => {
        return {
          ...circle,
          dragOn: false,
        };
      }),
    );

    if (
      //if you hit the target
      circleHitTest(
        circles[tokenId].x,
        circles[tokenId].y,
        circles[targetId].x,
        circles[targetId].y,
        circles[targetId].r * tolerance,
      ) &&
      (circles[targetId].mode === e.pointerType ||
        circles[targetId].mode === 'trackpad' ||
        (typeof e.pointerType === 'undefined' &&
          (circles[targetId].mode === 'mouse' ||
            circles[targetId].mode === 'trackpad'))) &&
      circles[targetId].isTarget
    ) {
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'hit_target',
          targetId,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'hit_target',
          targetId,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }

      activateCenter();
    } else if (
      //if you hit the center target with the right mode after the docking task
      //Just... don't look too hard at this condition.
      //Abandon all hope, ye who enter here
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      ) &&
      (circles[circles.length - 1].mode === e.pointerType ||
        (e.pointerType === 'mouse' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad')) ||
        (typeof e.pointerType === 'undefined' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad'))) &&
      circles[circles.length - 1].isTarget &&
      !circles[circles.length - 1].mouseFirstTarget
    ) {
      //I need to make a copy of the eventList state variable, because it doesn't
      //update quickly enough to have pointerUp events properly added to eventList
      //when advanceTrial() executes.
      //
      //To make sure these events are properly logged, all pointerUp events _also_
      //get added to listCopy, which is sent to advanceTrial() if it is called.
      //
      //...I blame React.
      let listCopy = JSON.parse(JSON.stringify(eventList));
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'hit_center',
          circles.length - 1,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
        listCopy.push([
          Date.now(),
          'hit_center',
          circles.length - 1,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'hit_center',
          circles.length - 1,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
        listCopy.push([
          Date.now(),
          'hit_center',
          circles.length - 1,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }

      advanceTrial(currPathIndex, circles[tokenId].mode, listCopy, missCount);
    } else if (
      //if you hit the center target with the wrong mode after docking
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      ) &&
      !(
        circles[circles.length - 1].mode === e.pointerType ||
        (e.pointerType === 'mouse' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad')) ||
        (typeof e.pointerType === 'undefined' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad'))
      ) &&
      circles[circles.length - 1].isTarget &&
      !circles[circles.length - 1].mouseFirstTarget
    ) {
      //console.log('pup, wrong mode');
      //add error to event log, show error, increment missCount
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          circles.length - 1,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          circles.length - 1,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }

      setErrorFlag(true);
      setMissCount(missCount + 1);
    } else if (
      //if you hit the center target with the right mode
      //when the first mode is mouse or trackpad
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      ) &&
      (circles[circles.length - 1].mode === e.pointerType ||
        (e.pointerType === 'mouse' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad')) ||
        (typeof e.pointerType === 'undefined' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad'))) &&
      circles[circles.length - 1].mouseFirstTarget &&
      circles[circles.length - 1].isTarget
    ) {
      //clear the center target, set up the token and targets
      setCircles(
        circles.map((circle) => {
          return {
            ...circle,
            isToken: circle.id === tokenId,
            isTarget: circle.id === targetId,
            mouseFirstTarget: false,
            isVisible: circle.id !== circles.length - 1,
          };
        }),
      );
    } else if (
      //if you hit the center target with the **wrong** mode
      //when the first mode is mouse or trackpad
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      ) &&
      !(
        circles[circles.length - 1].mode === e.pointerType ||
        circles[circles.length - 1].mode === 'trackpad' ||
        (typeof e.pointerType === 'undefined' &&
          (circles[circles.length - 1].mode === 'mouse' ||
            circles[circles.length - 1].mode === 'trackpad'))
      ) &&
      circles[circles.length - 1].mouseFirstTarget &&
      circles[circles.length - 1].isTarget
    ) {
      //add error to event log, show error, increment missCount
      //console.log('pup, wrong mode, first target');
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          circles.length - 1,
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'miss_wrong_mode',
          circles.length - 1,
          'mouse',
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }

      setErrorFlag(true);
      setMissCount(missCount + 1);
    } else if (
      //if you drop the token in the center, but the center isn't active
      circleHitTest(
        e.clientX,
        e.clientY,
        circles[circles.length - 1].x,
        circles[circles.length - 1].y,
        circles[circles.length - 1].r,
      ) &&
      !circles[circles.length - 1].isTarget
    ) {
      //console.log('pup, wrong mode, on center');
      //add error to event log, show error, increment missCount
      if (
        typeof e.pointerType !== 'undefined' ||
        typeof e.pressure !== 'undefined'
      ) {
        appendToEventList([
          Date.now(),
          'miss_center_not_on',
          'null',
          e.pointerType,
          e.clientX,
          e.clientY,
          e.pressure.toFixed(2),
          e.tiltX,
          e.tiltY,
        ]);
      } else {
        appendToEventList([
          Date.now(),
          'miss_center_not_on',
          'null',
          e.pointerType,
          e.clientX,
          e.clientY,
          0.0,
          0,
          0,
        ]);
      }

      setErrorFlag(true);
      setMissCount(missCount + 1);
    } else {
      //if you don't hit the target or the center
      if (
        circles[tokenId].dragOn &&
        !circleHitTest(
          e.clientX,
          e.clientY,
          circles[targetId].x,
          circles[targetId].y,
          circles[targetId].r * tolerance,
        ) &&
        !circleHitTest(
          e.clientX,
          e.clientY,
          circles[circles.length - 1].x,
          circles[circles.length - 1].y,
          circles[circles.length - 1].r,
        )
      ) {
        //console.log('pup, wrong placement');
        //add error to event log, show error, increment missCount
        if (
          typeof e.pointerType !== 'undefined' ||
          typeof e.pressure !== 'undefined'
        ) {
          appendToEventList([
            Date.now(),
            'miss_up',
            'null',
            e.pointerType,
            e.clientX,
            e.clientY,
            e.pressure.toFixed(2),
            e.tiltX,
            e.tiltY,
          ]);
        } else {
          appendToEventList([
            Date.now(),
            'miss_up',
            'null',
            e.pointerType,
            e.clientX,
            e.clientY,
            0.0,
            0,
            0,
          ]);
        }

        setErrorFlag(true);
        setMissCount(missCount + 1);
      }
    }
  };

  return (
    <div ref={usePreventDefault()}>
      <canvas
        className={style.canvas}
        ref={canvasRef}
        onPointerMove={pointerHandler}
        onMouseMove={mouseHandler}
        onPointerDown={pointerDownHandler}
        onMouseDown={pointerDownHandler}
        onMouseUp={pointerUpHandler}
        onPointerUp={pointerUpHandler}
        width={window.innerWidth}
        height={window.innerHeight - 10 + 'px'}
        {...rest}
      />
    </div>
  );
};

//function for drawing a circle
function drawCircle(ctx, x, y, radius, fill, targetOn, isCenter) {
  //Give target circles a larger radius
  let rad = targetOn && !isCenter ? radius * 1.5 : radius;
  ctx.strokeStyle = fill;
  ctx.lineWidth = 2;

  //If circle is target, but _not_ the center, it has a dashed line
  if (targetOn && !isCenter) {
    ctx.setLineDash([10, 10]);
  } else {
    ctx.setLineDash([]);
  }

  //Non-target circles have solid fill
  if (!targetOn || isCenter) {
    ctx.fillStyle = fill;
  }

  ctx.beginPath();
  ctx.ellipse(x, y, rad, rad, 0, 0, 2 * Math.PI);

  //Non-target circles have solid fill
  if (!targetOn || isCenter) {
    ctx.fill();
  }

  ctx.stroke();

  //Draw an extra circle with dashed lines around the center target
  if (isCenter) {
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.ellipse(x, y, rad * 1.15, rad * 1.15, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function circleHitTest(pX, pY, cX, cY, radius) {
  // calculate distance from pX, pY  to centre of circle
  let d = myDist(pX, pY, cX, cY);

  // if it's less than radius, we have a hit
  if (d <= radius) {
    return true;
  } else {
    return false;
  }
}

function myDist(pX, pY, qX, qY) {
  let a = pY - qY; // y difference
  let b = pX - qX; // x difference
  let c = Math.sqrt(a * a + b * b);
  return c;
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

export default Canvas;
