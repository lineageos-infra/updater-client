import type { FileEntry } from '@zip.js/zip.js'
import { DeltaArchiveManifest } from '@/ota/update_metadata'
import { BlobReader, ZipReader } from '@zip.js/zip.js'

export default class PayloadMetadataService {
  private static readonly OTA_PAYLOAD_MAGIC = 'CrAU'
  private static readonly OTA_PAYLOAD_HEADER_LENGTH_V1 = 20
  private static readonly OTA_PAYLOAD_HEADER_LENGTH_V2 = 24
  private static readonly MAX_MANIFEST_BYTES = 32 * 1024 * 1024

  private static readUint64BigEndian(view: DataView, offset: number) {
    const high = BigInt(view.getUint32(offset, false))
    const low = BigInt(view.getUint32(offset + 4, false))
    return (high << 32n) + low
  }

  private static parsePayloadMetadata(payloadBin: Uint8Array): DeltaArchiveManifest | null {
    if (payloadBin.byteLength < this.OTA_PAYLOAD_HEADER_LENGTH_V1) {
      return null
    }

    const view = new DataView(payloadBin.buffer, payloadBin.byteOffset, payloadBin.byteLength)
    const magic = new TextDecoder().decode(payloadBin.subarray(0, 4))

    if (magic !== this.OTA_PAYLOAD_MAGIC) {
      return null
    }

    const payloadFormatVersion = this.readUint64BigEndian(view, 4)
    const manifestSize = this.readUint64BigEndian(view, 12)
    const manifestOffset =
      payloadFormatVersion >= 2n
        ? this.OTA_PAYLOAD_HEADER_LENGTH_V2
        : this.OTA_PAYLOAD_HEADER_LENGTH_V1

    if (payloadFormatVersion >= 2n && payloadBin.byteLength < this.OTA_PAYLOAD_HEADER_LENGTH_V2) {
      return null
    }

    if (manifestSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      return null
    }

    const manifestSizeNumber = Number(manifestSize)

    if (payloadBin.byteLength < manifestOffset + manifestSizeNumber) {
      return null
    }

    const manifestBytes = payloadBin.subarray(manifestOffset, manifestOffset + manifestSizeNumber)
    return DeltaArchiveManifest.decode(manifestBytes)
  }

  private static async readPayloadMetadataBytes(payloadBinEntry: FileEntry) {
    let targetBytes = this.OTA_PAYLOAD_HEADER_LENGTH_V1
    let buffer = new Uint8Array(targetBytes)
    let bytesWritten = 0
    let headerParsed = false
    let shouldStop = false
    let isInvalidPayload = false

    const abortController = new AbortController()

    const stopRead = () => {
      shouldStop = true
      abortController.abort()
    }

    const writer = new WritableStream<Uint8Array>({
      write: (chunk) => {
        let offset = 0

        while (offset < chunk.byteLength) {
          if (bytesWritten === targetBytes) {
            if (headerParsed) {
              stopRead()
              return
            }

            const headerView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
            const magic = new TextDecoder().decode(buffer.subarray(0, 4))

            if (magic !== this.OTA_PAYLOAD_MAGIC) {
              isInvalidPayload = true
              stopRead()
              return
            }

            const payloadFormatVersion = this.readUint64BigEndian(headerView, 4)
            const manifestSize = this.readUint64BigEndian(headerView, 12)
            const manifestOffset =
              payloadFormatVersion >= 2n
                ? this.OTA_PAYLOAD_HEADER_LENGTH_V2
                : this.OTA_PAYLOAD_HEADER_LENGTH_V1

            if (manifestSize > BigInt(Number.MAX_SAFE_INTEGER)) {
              isInvalidPayload = true
              stopRead()
              return
            }

            const manifestSizeNumber = Number(manifestSize)

            if (manifestSizeNumber > this.MAX_MANIFEST_BYTES) {
              isInvalidPayload = true
              stopRead()
              return
            }

            targetBytes = manifestOffset + manifestSizeNumber

            if (targetBytes > buffer.byteLength) {
              const expanded = new Uint8Array(targetBytes)
              expanded.set(buffer, 0)
              buffer = expanded
            }

            headerParsed = true

            if (bytesWritten === targetBytes) {
              stopRead()
              return
            }
          }

          const writableBytes = targetBytes - bytesWritten
          const chunkBytes = chunk.byteLength - offset
          const copyBytes = Math.min(writableBytes, chunkBytes)

          buffer.set(chunk.subarray(offset, offset + copyBytes), bytesWritten)
          bytesWritten += copyBytes
          offset += copyBytes

          if (headerParsed && bytesWritten === targetBytes) {
            stopRead()
            return
          }
        }
      }
    })

    try {
      await payloadBinEntry.getData(writer, { signal: abortController.signal })
    } catch {
      if (!shouldStop) {
        throw new Error('Failed while reading payload.bin metadata bytes')
      }
    }

    if (isInvalidPayload || !headerParsed || bytesWritten < targetBytes) {
      return null
    }

    return buffer
  }

  static async readMetadataFromOta(blob: File): Promise<DeltaArchiveManifest | null> {
    const zipReader = new ZipReader(new BlobReader(blob))

    try {
      const entries = await zipReader.getEntries()
      const payloadBinEntry = entries.find(
        (entry) => !entry.directory && entry.filename === 'payload.bin'
      )

      if (!payloadBinEntry) {
        return null
      }

      if (!('getData' in payloadBinEntry)) {
        return null
      }

      const payloadBin = await this.readPayloadMetadataBytes(payloadBinEntry)

      if (!payloadBin) {
        return null
      }

      return this.parsePayloadMetadata(payloadBin)
    } finally {
      await zipReader.close()
    }
  }
}
