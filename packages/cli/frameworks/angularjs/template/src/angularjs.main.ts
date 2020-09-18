import './angularjs.module';
import './components/app/component.angularjs';
import './components/input/component.angularjs';
import './components/series/create/component.angularjs';
import './components/series/edit/component.angularjs';
import './components/series/editor/component.angularjs';
import './components/series/list/component.angularjs';

import * as angular from 'angular';

import { DI } from '@leanup/lib/helpers/injector';

import { APP_HTML_ELEMENT } from './shares/constant';

DI.register('Framework', {
  ...require('angular/package.json'),
  name: 'AngularJS',
});
require('./shares/register');
require('./shares/routing');

const htmlDivElement: HTMLDivElement | null = document.querySelector('div#angularjs');
if (htmlDivElement instanceof HTMLDivElement) {
  htmlDivElement.style.display = 'inline';
  htmlDivElement.appendChild(APP_HTML_ELEMENT);
  angular.bootstrap(htmlDivElement, ['app']);
}
