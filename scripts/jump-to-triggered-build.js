// ==UserScript==
// @name         Jump to triggered Build
// @namespace    http://tampermonkey.net/
// @version      0.1
// @downloadURL  TBD
// @description  Jumps straight to the underlying triggered build for trigger jobs
// @author       Alexander Smith
// @include      https://buildkite.com/*/*/builds/*
// @grant        none
// ==/UserScript==

const TRIGGER_JOBS_SELECTOR = '.build-pipeline-job-trigger';

async function main() {
  const jobs = document.querySelectorAll(TRIGGER_JOBS_SELECTOR);

  for (let job of jobs) {
    const jobLink = job.getAttribute('href');
    if (!jobLink || !jobLink.includes('#')) continue;
    const detailsElem = document.querySelector(`#${jobLink.split('#')[1]}`);
    if (!detailsElem) continue;
    const detailsLink = detailsElem.getAttribute('href');
    if (!detailsLink) continue;
    job.setAttribute('href', detailsLink);
  }
}

main().catch(console.error);
