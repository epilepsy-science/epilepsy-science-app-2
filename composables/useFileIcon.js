import {compose, concat, propEq, propOr, useWith, find} from "ramda";
import * as files from '~/utils/supported-files/files.json'

/**
 * Get the svg image
 * @param {String} icon
 * @param {String} packageType
 * @returns {String}
 */
export default function (icon, packageType) {
    if (packageType === 'Directory' || packageType === 'folder') {
        return '/file-icons/icon-folder.svg'
    }

    if (packageType === 'ExternalFile') {
        return '/file-icons/icon-linked-file.svg'
    }

    const list = Array.isArray(files) ? files : files.default
    return getSvgIcon(icon, list)
}

/**
 * Lookup the svg per icon key
 * @param {String} icon
 * @param {Array} files
 * @returns {String}
 */
const getSvgIcon = compose(
    concat('/file-icons/'),
    propOr('icon-generic.svg', 'SVG'),
    useWith(find, [propEq('Icon')])
)