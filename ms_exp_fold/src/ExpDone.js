import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import JSZip from 'jszip';

const ExpDone = (props) => {
  const { fileUploadError, pNo } = props;
  const [zipFile, setZipFile] = useState();
  const [url, setURL] = useState('');

  useEffect(() => {
    let zip = new JSZip();

    const items = { ...localStorage };

    for (var item in items) {
      if (item.startsWith(pNo)) {
        zip.file(item, items[item]);
      }
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      setZipFile(content);
      setURL(window.URL.createObjectURL(content));
    });
  }, [pNo]);

  // eslint-disable-next-line no-unused-vars
  function handleClick() {
    // eslint-disable-next-line no-console
    console.log(zipFile);
    // eslint-disable-next-line no-console
    console.log(url);
  }

  function FileDownloadText() {
    if (fileUploadError) {
      return (
        <div className="text-center">
          <p>
            {' '}
            One of more of your logs failed to upload. Please click the
            &quot;Download All Logs&quot; link below to download your logs as a
            ZIP file, and email them to mjfoley@uwaterloo.ca.{' '}
          </p>
          <p></p>

          <a download={`${pNo}_logs.zip`} href={url}>
            Download All Logs
          </a>
          <p></p>
        </div>
      );
    } else {
      return <div></div>;
    }
  }

  return (
    <Container>
      <div className="text-center" style={{ fontSize: 'larger' }}>
        <p></p>
        <p></p>
        <p>You have finished the experiment!</p>

        <FileDownloadText />

        <p>
          To receive your remuneration, please email mjfoley@uwaterloo.ca or
          message the experimenters to say you have finished the experiment.
        </p>
      </div>
    </Container>
  );
};

export default ExpDone;
