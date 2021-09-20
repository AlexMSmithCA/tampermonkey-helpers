// ==UserScript==
// @name         Hide passed jobs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @downloadURL  TBD
// @description  Hides passed jobs from a Buildkite build.
// @author       Alexander Smith
// @include      https://buildkite.com/*/*/builds/*
// @grant        none
// ==/UserScript==

const SELECTOR_PREFIX = 'tampermonkey-show-only-failed-jobs-';
const BUTTON_CONTAINER_SELECTOR = 'div.build-panel > div.flex > div.flex-none';
const JOB_PASSED_CLASS = 'build-pipeline-state-passed';
const JOB_FAILED_CLASS = 'build-pipeline-state-failed';
const JOBS_SELECTOR = `.build-pipeline-job`;
const JOB_GROUPS_SELECTOR = '.job-group';

const BUTTON_ENUM = {
  showFailed: '🔴',
  showAll: '🟢'
};
const ARIA_STATE = `aria-${SELECTOR_PREFIX}state`;
const HIDE_PASSED_JOBS_TEMPLATE = `
    <button
      class="btn ${SELECTOR_PREFIX}hide-passed-jobs"
      ${ARIA_STATE}="disabled"
      title="Show/hide passing jobs"
    >
      ${BUTTON_ENUM.showAll}
    </button>
  `.trim();

const CUSTOM_STYLES = `
  .job-group ${SELECTOR_PREFIX}hidden {
    display: none;
  }

  .${SELECTOR_PREFIX}hide-passed-jobs {
    padding: 0px 10px 0px 0px;
    margin-top: -5px;
  }`.trim();

function initStyles() {
  const elem = document.createElement('style');
  elem.innerHTML = CUSTOM_STYLES;
  document.head.appendChild(elem);
}

function handleClick() {
  const checkEnabled = () => this.getAttribute(ARIA_STATE) === 'enabled';

  // Update state
  if (checkEnabled()) {
    this.setAttribute(ARIA_STATE, 'disabled');
    this.innerHTML = BUTTON_ENUM.showFailed;
  } else {
    this.setAttribute(ARIA_STATE, 'enabled');
    this.innerHTML = BUTTON_ENUM.showAll;
  }

  // Handle all downstream job links
  [...document
    .querySelectorAll(JOBS_SELECTOR)]
    .filter(elem => hasClass(elem, JOB_PASSED_CLASS))
    .forEach(elem => {
      checkEnabled()
        ? addClass(elem, 'hidden')
        : removeClass(elem, 'hidden')
    });

  // Compatibility with "Group Buildkite jobs"
  // https://gist.github.com/chrisdothtml/dc89ff09a1642acf39db768a2659cc2c/raw/groupBuildkiteJobs.user.js
  [...document
    .querySelectorAll(JOB_GROUPS_SELECTOR)]
    .forEach(elem => {
      if (checkEnabled()) {
        const hasFailedChildren = getChildren(elem)
          .filter(child => hasClass(child, JOB_FAILED_CLASS))
          .length > 0;
        if (hasFailedChildren) removeClass(elem, 'collapsed')
        else addClass(elem, 'hidden');
      } else {
        removeClass(elem, 'hidden');
      }
    });
}

async function main() {
  initStyles();

  const button = createElementFromHTML(HIDE_PASSED_JOBS_TEMPLATE);
  button.addEventListener('click', handleClick);

  document
    .querySelector(BUTTON_CONTAINER_SELECTOR)
    .appendChild(button);
}

main().catch(console.error);

/* Helpers */
function createElementFromHTML(html) {
  var template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstChild;
}

function addClass(elem, name) {
  if (hasClass(elem, name)) return;
  elem.classList.add(name);
}

function removeClass(elem, name) {
  if (!hasClass(elem, name)) return;
  elem.classList.remove(name);
}

function hasClass(elem, name) {
  return elem.classList.contains(name);
}

function getChildren(elem) {
  return [...elem.children];
}
