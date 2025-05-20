/**
 * converts raw metric data value to appropriate unit of bytes, kb, or mb
 * @param {Number} storage
 * @returns {String}
 */
export default function (storage) {
    if (!storage || storage <= 0) {
        return String.fromCharCode(8212)
    }
    return _format(storage)
}

/**
 * @param {Number} storage
 * @returns {String}
 */
function _format(storage) {
    const kb = 1e3
    const mb = 1e6
    const gb = 1e9
    const tb = 1e12
    const metric = parseInt(storage, 10)

    if (metric < kb) {
        return `${metric} B`
    } else if (metric >= kb && metric < mb) {
        return `${_round2(metric, kb)} KB`
    } else if (metric >= mb && metric < gb) {
        return `${_round2(metric, mb)} MB`
    } else if (metric >= gb && metric < tb) {
        return `${_round2(metric, gb)} GB`
    } else {
        return `${_round2(metric, tb)} TB`
    }
}

/**
 * rounds to two decimal places
 * @param {Number} dividend
 * @param {Number} divisor
 * @returns {Number|Float}
 */
function _round2(dividend, divisor) {
    return Math.round((dividend / divisor) * 100) / 100
}