import NindoWidgetModule from './src/NindoWidgetModule';

export async function updateWidgetData(data: string): Promise<boolean> {
  return await NindoWidgetModule.updateWidgetData(data);
}

export async function startBackgroundUpdates(): Promise<boolean> {
  return await NindoWidgetModule.startBackgroundUpdates();
}

export async function stopBackgroundUpdates(): Promise<boolean> {
  return await NindoWidgetModule.stopBackgroundUpdates();
}

export async function isPinSupported(): Promise<boolean> {
  return await NindoWidgetModule.isPinSupported();
}

export async function requestPinWidget(): Promise<boolean> {
  return await NindoWidgetModule.requestPinWidget();
}
