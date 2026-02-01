import * as React from 'react';

import { NindoWidgetViewProps } from './NindoWidget.types';

export default function NindoWidgetView(props: NindoWidgetViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
