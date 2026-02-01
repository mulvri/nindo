import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { NindoWidgetViewProps } from './NindoWidget.types';

const NativeView: React.ComponentType<NindoWidgetViewProps> =
  requireNativeViewManager('NindoWidget');

export default function NindoWidgetView(props: NindoWidgetViewProps) {
  return <NativeView {...props} />;
}
