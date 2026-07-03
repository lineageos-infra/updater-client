import CryptoWorker from './CryptoService.worker.ts?worker'

export interface SignInfo {
  commonName: string | undefined
  countryName: string | undefined
  localityName: string | undefined
  organizationalUnitName: string | undefined
  organizationName: string | undefined
  stateOrProvinceName: string | undefined
  publicKeyFingerprint: string
  serialNumber: string
  validity: { notBefore: Date; notAfter: Date }
}

export type VerifyResult =
  | { status: boolean; msg: string; signInfo: SignInfo }
  | { status: false; msg: string; signInfo?: undefined }

export type CryptoRequest = { type: 'verify' | 'sha256'; blob: Blob }

export default class CryptoService {
  private static run<T>(request: CryptoRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = new CryptoWorker()
      worker.onmessage = (event: MessageEvent<T>) => {
        resolve(event.data)
        worker.terminate()
      }
      worker.onerror = (event) => {
        reject(new Error(event.message || 'Worker error'))
        worker.terminate()
      }
      worker.postMessage(request)
    })
  }

  static verifyPackage(blob: Blob): Promise<VerifyResult> {
    return this.run({ type: 'verify', blob })
  }

  static sha256(blob: Blob): Promise<string> {
    return this.run({ type: 'sha256', blob })
  }
}
