import MiniStateContainer from '../Components/MiniStateContainer'
import Menubar from '../Components/Menubar'
import "../Style/Dashboard.css"
import WorkingHourBarChat from '../Components/WorkingHourBarChat'
import { HorizentalCardsContainer } from '../Components/Cards'
import TimeTable from '../Components/TimeTable'
import { useEffect, useState } from 'react'
import { getTeacher, getTeacherList, getTeacherSchedule } from '../Script/TeachersDataFetcher'
import { getSubjectDetails, getSubjects } from '../Script/SubjectsDataFetcher'

function DashboardPage() {
    const [perDayValue, setPerDayValue] = useState([0, 0, 0, 0, 0])
    return (
        <>
            <Menubar activeMenuIndex={2} />
            <div className='main-container dashboard'>
                <div className='left-sub-container'>
                    <MiniStateContainer />
                    <div className='empty-container'>Under Development</div>
                    <WorkingHourBarChat perDayValue={perDayValue} />
                </div>
                <div className='right-sub-container'>
                    <TeacherDetailsContainer setPerDayValue={setPerDayValue} />
                </div>
            </div>
        </>
    )
}

function TeacherDetailsContainer({ setPerDayValue }) {
    const [teachersList, setTeahersList] = useState([])
    const [semesters, setSemesters] = useState([])
    const [teacherTimeTableDetails, setTeacherTimeTableDetails] = useState([])
    const [subjectDetails, setSubjectDetails] = useState([])
    const [timeTableOwner, setTimeTableOwner] = useState("")
    useEffect(() => {
        getTeacherList(setTeahersList);
        getSubjects(setSubjectDetails)
    }, [])

    const [teacherDetails, setTeacherDetails] = useState({
        freeTime: [],
        subjects: [],
    })
    function teacherCardClickHandler(event) {
        getTeacher(event.target.title, updateValues)
        function updateValues(data) {
            setTeacherDetails(data)
            let semesters = [];
            for (let index = 0; index < data.subjects.length; index++) {
                getSubjectDetails(data.subjects[index], findAndPushSem)
            }
            function findAndPushSem(subjectData) {
                if (semesters.indexOf(subjectData.sem) === -1) semesters.push(subjectData.sem)
                setSemesters(semesters)
            }
            getTeacherSchedule(event.target.title, setTeacherTimeTableDetails)
            setTimeTableOwner(event.target.title)
        }
    }
    return (
        <div className='teachers-details-container'>
            <HorizentalCardsContainer cardClassName={"teacher-card"} cardData={teachersList} cardClickHandler={teacherCardClickHandler} />
            <TeachersTimeTableContainer teacherTimeTableDetails={teacherTimeTableDetails} subjectDetails={subjectDetails} owner={timeTableOwner} />
            <div className='sem-and-subject-container'>
                <SemesterContainer semList={semesters} />
                <SubjectContainer subList={teacherDetails.subjects} />
            </div>
        </div>
    )
}

function TeachersTimeTableContainer({ teacherTimeTableDetails, subjectDetails, owner }) {
    let sir = "Sir";
    return (
        <div className='time-table-wrapper'>
            <div className='heading'>Time Table for {sir}</div>
            <TimeTable subjectIndexAtPeriod={2} className='teacher-time-table' timeTableWidthInPercent={92} details={teacherTimeTableDetails} subjectDetails={subjectDetails} owner={owner} />
        </div>
    )
}

function SemesterContainer({ semList = [1, 2, 5, 6] }) {
    let sems = [];
    for (let index = 0; index < semList.length; index++) {
        sems.push(<div className='sem' key={semList[index]}>{semList[index]}</div>)
    }
    return (
        <div className='sem-container'>
            <div className='heading'>Semesters</div>
            <div className='sub-sem-container'>
                {sems}
            </div>
        </div>
    )
}

function SubjectContainer({ subList = ["a", "b", "c"] }) {
    let subs = [];
    for (let index = 0; index < subList.length; index++) {
        subs.push(<div className='subject' key={subList[index]}>{subList[index].toUpperCase()}</div>)
    }
    return (
        <div className='subject-container'>
            <div className='heading'>Subjects</div>
            <div className='sub-subject-container'>
                {subs}
            </div>
        </div>
    )
}

export default DashboardPage