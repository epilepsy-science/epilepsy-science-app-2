import moment from "moment";

export default function (date) {
    return moment.utc(date).format('L')
}