/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */
enum GamepadButton {
    //% block="Up"
    Up = EventBusSource.MICROBIT_ID_IO_P13,
    //% block="Left"
    Left = EventBusSource.MICROBIT_ID_IO_P12,
    //% block="Down"
    Down = EventBusSource.MICROBIT_ID_IO_P15,
    //% block="Right"
    Right = EventBusSource.MICROBIT_ID_IO_P14
}
enum GamepadEvents {
    //% block="pressed"
    Down = EventBusValue.MICROBIT_BUTTON_EVT_DOWN,
    //% block="released"
    Up = EventBusValue.MICROBIT_BUTTON_EVT_UP,
    //% block="click"
    Click = EventBusValue.MICROBIT_BUTTON_EVT_CLICK
}
enum GamepadJoystick {
    // % block="X"
    x = 0,
    // % block="Y"
    y = 1
}
//% weight=10 color=#0fbc11 icon="\uf11b" block="Gamepad"
namespace joystick {
    let initflag: number = 0
    let joystickStep = 128
    function pininit(): void {
        pins.setPull(DigitalPin.P12, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone)
        pins.setEvents(DigitalPin.P12, PinEventType.Touch)
        pins.setEvents(DigitalPin.P13, PinEventType.Touch)
        pins.setEvents(DigitalPin.P14, PinEventType.Touch)
        pins.setEvents(DigitalPin.P15, PinEventType.Touch)
        initflag = 1
    }
    /**
     * TODO: ボタンの状態を通知する
     * @param Button ボタン。, eg: Down Allow
     */
    //% blockId=Gamepad_Button_Sence block="Button|%Button|Is Pressed"
    export function ButtonState(Button: GamepadButton): boolean {
        if (initflag == 0) pininit()
        return (pins.digitalReadPin(Button >> 0) == 0) ? true : false
    }
    /**
     * TODO: ボタンが押されたとき
     * @param Button ボタン。, eg: Down Allow
     * @param Event きっかけ。, eg: pressed
     * @param handler 処理。
     */
    //% blockId=Gamepad_create_event block="on Button|%Button|Is %Event"
    export function onEvent(Button: GamepadButton, Event: GamepadEvents, handler: Action) {
        if (initflag == 0) pininit()
        control.onEvent(Button >> 0, Event >> 0, handler);
    }
    /**
     * TODO: ジョイスチックの位置を取り出す
     * @param axis 軸方向。, eg: x
     */
    //% blockId=Gamepad_get_joystick block="Get Joystick|%axis| travel"
    export function JoyStick(axis: GamepadJoystick): number {
        if (axis == GamepadJoystick.x) {
            const JoystickX = pins.analogReadPin(AnalogPin.P1) - 511.5
            return Math.trunc(JoystickX / joystickStep / 2) * joystickStep
        } else {
            const JoystickY = pins.analogReadPin(AnalogPin.P2) - 511.5
            return Math.trunc(JoystickY / joystickStep / 2) * joystickStep
        }
        return 0
    }
    /**
     * TODO: ジョイスチックの分解能を設定する
     * @param reso 分解能。, eg: 32
     */
    //% blockId=Gamepad_set_zero_limit block="Set resolution to |%reso|"
    export function setResolution(reso: number): void {
        joystickStep = (512 / reso) >> 0
    }
    /**
     * TODO: ジョイスティックが動いたとき
     * @param axis 軸方向。, eg: x
     * @param handler 処理。
     */
    //% blockId=Gamepad_create_event block="on Joystick Move on |%axis| axis"
    export function onJoystick(axis: GamepadJoystick, handler: Action) {
        let JoystickEventId = 0x4100
        let lastJoystickX: number = JoyStick(GamepadJoystick.x)
        let lastJoystickY: number = JoyStick(GamepadJoystick.y)
        control.onEvent(JoystickEventId, axis, handler);
        if (initflag == 0) {
            pininit();
            control.inBackground(() => {
                while (true) {
                    const JoystickX = JoyStick(GamepadJoystick.x)
                    if (JoystickX != lastJoystickX) {
                        lastJoystickX = JoystickX;
                        control.raiseEvent(JoystickEventId, GamepadJoystick.x);
                    }
                    const JoystickY = JoyStick(GamepadJoystick.y)
                    if (JoystickY != lastJoystickY) {
                        lastJoystickY = JoystickY;
                        control.raiseEvent(JoystickEventId, GamepadJoystick.y);
                    }
                    basic.pause(50);
                }
            })
        }
    }
}
