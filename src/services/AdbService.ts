import {
  type AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
  AdbDaemonWebUsbDeviceObserver
} from '@yume-chan/adb-daemon-webusb'
import AdbWebCredentialStore from '@yume-chan/adb-credential-web'
import { Adb, AdbDaemonTransport } from '@yume-chan/adb'

const ADB_EXIT_SUCCESS = 'DONEDONE'
const ADB_EXIT_FAILURE = 'FAILFAIL'
const ADB_SIDELOAD_CHUNK_SIZE = 65536

export class AdbService {
  private manager: AdbDaemonWebUsbDeviceManager | undefined
  private device: AdbDaemonWebUsbDevice | undefined
  private adb: Adb | undefined
  private credentialStore = new AdbWebCredentialStore()
  private observer: AdbDaemonWebUsbDeviceObserver | undefined

  get isConnected(): boolean {
    return !!this.adb
  }

  get deviceName(): string | undefined {
    return this.device?.name
  }

  get deviceSerial(): string | undefined {
    return this.device?.serial
  }

  init() {
    this.manager = AdbDaemonWebUsbDeviceManager.BROWSER
  }

  async initObserver(): Promise<AdbDaemonWebUsbDeviceObserver> {
    if (!this.manager) throw new Error('AdbService not initialized')
    this.observer = await this.manager.trackDevices()

    return this.observer
  }

  stopObserver(): void {
    if (!this.observer) throw new Error('Observer not initialized')
    this.observer.stop()
  }

  async connect(): Promise<{ name: string; serial: string }> {
    if (!this.manager) throw new Error('AdbService not initialized')

    this.device = await this.manager.requestDevice()
    if (!this.device) throw new Error('No device selected')

    const connection = await this.device.connect()
    const transport = await AdbDaemonTransport.authenticate({
      serial: this.device.serial,
      connection,
      credentialStore: this.credentialStore
    })

    this.adb = new Adb(transport)
    return { name: this.device.name, serial: this.device.serial }
  }

  async disconnect(): Promise<void> {
    await this.adb?.close()
    this.adb = undefined
    this.device = undefined
  }

  async sideload(data: Blob, onProgress: (percentage: number) => void = () => {}): Promise<void> {
    if (!this.adb) throw new Error('Not connected')

    const socket = await this.adb.createSocket(
      `sideload-host:${data.size}:${ADB_SIDELOAD_CHUNK_SIZE}`
    )
    const reader = socket.readable.getReader()
    const writer = socket.writable.getWriter()

    try {
      let transmittedBytes = 0

      while (true) {
        const res = await reader.read()
        if (res.done) throw new Error('Reader unexpectedly ended')

        const resStr = new TextDecoder('ascii').decode(res.value)

        if (resStr === ADB_EXIT_SUCCESS) break
        if (resStr === ADB_EXIT_FAILURE) throw new Error('Sideload failed')

        const requestedBlock = parseInt(resStr)
        const offset = requestedBlock * ADB_SIDELOAD_CHUNK_SIZE

        if (offset > data.size) {
          throw new Error(
            `adb: failed to read block ${requestedBlock} at offset ${offset}, past end ${data.size}`
          )
        }

        const chunk = data.slice(offset, Math.min(offset + ADB_SIDELOAD_CHUNK_SIZE, data.size))
        await writer.write(new Uint8Array(await chunk.arrayBuffer()))

        transmittedBytes += chunk.size
        onProgress(Math.floor((transmittedBytes / data.size) * 100))
      }
    } finally {
      await socket.close()
      this.adb = undefined
    }
  }
}
