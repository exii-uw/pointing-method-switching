import React, { useState } from 'react';

const GoogleFormSurvey = (props) => {
  const { pNo, dispatch, prefillParticipant, formId } = props;

  let src = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;
  src = `${src}&${prefillParticipant}=${pNo}`;

  const [hasLoaded, setHasLoaded] = useState();

  function handleLoad() {
    if (hasLoaded) {
      dispatch({ type: 'next' });
    } else {
      setHasLoaded(true);
    }
  }

  return (
    <iframe
      style={{
        width: '100%',
        height: '100vh',
      }}
      // ref='iframe'
      title="Mode Switch Survey"
      src={src}
      frameBorder="0"
      marginHeight="0"
      marginWidth="0"
      onLoad={handleLoad}
    >
      Loading...
    </iframe>
  );
  //https://docs.google.com/forms/d/e/1FAIpQLScD4yafH6kjpfTjvYFZx6SyOA9iUW0-aM72L17eo0mT1QkHfA/viewform?usp=pp_url&entry.676507866=Hi
};

export default GoogleFormSurvey;
