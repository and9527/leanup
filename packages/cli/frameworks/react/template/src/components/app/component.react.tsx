import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { RouterService } from '../../services/router/service';
import { Filters } from '../../shares/filters';
import { CreateSerieComponent } from '../series/create/component.react';
import { EditSerieComponent } from '../series/edit/component.react';
import { ListSerieComponent } from '../series/list/component.react';
import { AppController, ResolvedRoute } from './controller';

export class AppComponent extends ReactComponent<unknown, AppController> implements GenericComponent {
  public ctrl: AppController = new AppController();
  private resolvedRoute: ResolvedRoute = {
    url: 'series',
  };

  public constructor(props: unknown) {
    super(props, new AppController());
    RouterService.subscribe((route: { url: string }, params: { id: number }, query: unknown) => {
      this.resolvedRoute = {
        params,
        query,
        url: route.url,
      };
      this.forceUpdate();
    });
  }

  public render(): JSX.Element {
    return (
      <div class="my-app">
        <h1>
          {this.ctrl.framework.name} v{this.ctrl.framework.version}
        </h1>
        <small>{this.ctrl.finishedRendering} ms upcomming time</small>
        {this.resolvedRoute.url === 'series' && <ListSerieComponent />}
        {this.resolvedRoute.url === 'series/create' && <CreateSerieComponent />}
        {this.resolvedRoute.url === 'series/:id/edit' && <EditSerieComponent resolvedRoute={this.resolvedRoute} />}
        <small>
          Used filters: {Filters.date(this.ctrl.dummies.date)} | {Filters.currency(this.ctrl.dummies.price)} €
        </small>
        <br />
        <small>
          Build with: {this.ctrl.cli.name} v{this.ctrl.cli.version}
        </small>
      </div>
    );
  }
}
