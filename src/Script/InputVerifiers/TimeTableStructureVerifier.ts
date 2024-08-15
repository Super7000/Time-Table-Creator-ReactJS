export default function verifyTimeTableStructureInputs(timeTableStructureFieldValues: any) {
    let timeTableStructure = Object()

    //Validating year count
    if (!timeTableStructureFieldValues.semesterCount) {
        alert("semester count can't be empty")
        return false
    }
    // must be an positive integer number
    let semesterCount = timeTableStructureFieldValues.semesterCount
    if (!isPositiveWholeNumber(semesterCount)) {
        alert("Please enter a valid year count")
        return false
    }
    timeTableStructure.semesterCount = semesterCount

    //Validating period count
    if (!timeTableStructureFieldValues.periodCount) {
        alert("period count can't be empty")
        return false
    }
    // must be an positive integer number
    let periodCount = timeTableStructureFieldValues.periodCount
    if (!isPositiveWholeNumber(periodCount)) {
        alert("Please enter a valid period count")
        return false
    }
    timeTableStructure.periodCount = periodCount

    //Validating sections per year
    if (!timeTableStructureFieldValues.sectionsPerSemester) {
        alert("period count can't be empty")
        return false
    }
    let sectionsPerSemester
    try {
        sectionsPerSemester = timeTableStructureFieldValues.sectionsPerSemester
    } catch (error) {
        sectionsPerSemester = ""
        alert("Please enter sections per year in correct format")
        return false
    }
    if (!sectionsPerSemester) return false
    if (!((sectionsPerSemester instanceof Array) && sectionsPerSemester.every(
        (value) => isPositiveWholeNumber(value)
    ))) {
        alert("Please enter sections per year in correct format")
        return false
    }
    if (sectionsPerSemester.length !== timeTableStructure.semesterCount) {
        alert("Number of year in sections per year must be equal to year count")
        return false
    }
    timeTableStructure.sectionsPerSemester = sectionsPerSemester

    //Validating breaks per year
    if (!timeTableStructureFieldValues.breaksPerSemester) {
        alert("period count can't be empty")
        return false
    }
    let breaksPerSemester
    try {
        breaksPerSemester = timeTableStructureFieldValues.breaksPerSemester
    } catch (error) {
        breaksPerSemester = ""
        alert("Please enter break locations per year in correct format")
        return false
    }
    if (!breaksPerSemester) return false
    if (!((breaksPerSemester instanceof Array) && breaksPerSemester.every(
        (subarr) =>
            (subarr instanceof Array) &&
            subarr.every(
                (value) => isPositiveWholeNumber(value)
            )
    ))) {
        alert("Please enter break locations per year in correct format")
        console.log(timeTableStructure)
        return false
    }
    if (breaksPerSemester.length !== timeTableStructure.semesterCount) {
        alert("Number of semesters in break locations per year must be equal to year count")
        return false
    }
    if (
        !((breaksPerSemester instanceof Array) && breaksPerSemester.every(
            (subarr) =>
                (subarr instanceof Array) &&
                subarr.every(
                    (value) => (value <= timeTableStructure.periodCount)
                )
        ))
    ) {
        alert("Break locations must be lesser than or equal to period count")
        return false
    }
    timeTableStructure.breaksPerSemester = breaksPerSemester
    return timeTableStructure
}

const isPositiveWholeNumber = (num: number) => {
    if (!Number.isInteger(num) || num < 0 || Number.isNaN(num)) return false
    else return true
}