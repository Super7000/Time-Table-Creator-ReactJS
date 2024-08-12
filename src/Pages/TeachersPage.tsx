import MiniStateContainer from '../Components/MiniStateContainer.tsx'
import Menubar from '../Components/Menubar.tsx'
import Cards from '../Components/Cards.tsx'
import "../Style/Teachers.css"
import { FormEvent, memo, useCallback, useEffect, useRef, useState } from 'react'
import SearchBar from '../Components/SearchBar.tsx'
import { deleteTeacher, getTeacher, getTeachersList, saveTeacher } from '../Script/TeachersDataFetcher'
import { getTimeTableStructure } from '../Script/TimeTableDataFetcher'
import { getSubjectsList } from '../Script/SubjectsDataFetcher'
import "../Script/commonJS"
import { hasElement } from '../Script/util.ts'
import TagInput from '../Components/TagInput.tsx'
import OwnerFooter from '../Components/OwnerFooter.tsx'
import Loader from '../Components/Loader.tsx'
import { verifyTeacherInputs } from '../Script/InputVerifiers/TeacherFormVerifier.ts'
import { Teacher } from '../data/Types.ts'

function TeachersPage() {
    return (
        <>
            <Menubar activeMenuIndex={1} />
            <div className='main-container teachers'>
                <MainComponents />
                <OwnerFooter />
            </div>
        </>
    )
}

function MainComponents() {
    const [teachersList, setTeahersList] = useState<string[]>([]);
    const [teacherName, setTeacherName] = useState<string>("");
    const [displayLoader, setDisplayLoader] = useState<boolean>(false);
    const [filteredTeacherList, setFilteredTeacherList] = useState<string[]>([])

    useEffect(() => {
        startUpFunction()
    }, [])
    const startUpFunction = useCallback(() => {
        getTeachersList(setTeahersList); // api call
        setTeacherName("");
        setDisplayLoader(false);
        try {
            let paramString = window.location.href.split('?')[1];
            let queryString = new URLSearchParams(paramString);
            let urlData: [string, string] = ["", ""];
            for (let pair of queryString.entries()) {
                urlData = [pair[0], pair[1].split("#")[0]];
                break;
            }
            if (urlData[0] === "click") {
                let clicked = false;
                let interval = setInterval(() => {
                    const cardsContainer = document.querySelector(".cards-container")
                    let card: HTMLDivElement | null | undefined = cardsContainer?.querySelector(".card.data[title=" + urlData[1] + "]")
                    if (!clicked) {
                        try {
                            (card !== undefined && card !== null) ? card.click() : ""
                            clicked = true
                        } catch (err) { }
                    } else {
                        clearInterval(interval)
                    }
                }, 500)
            }
        } catch (err) {
            console.log("%cNo Click Query Found", "color: green");
        }
    }, [])
    return (
        <>
            <div className='top-sub-container'>
                <div className='left-sub-container'>
                    <div className='tools-container'>
                        <MiniStateContainer onChange={startUpFunction} />
                        <SearchBar array={teachersList} onChange={setFilteredTeacherList} />
                    </div>
                    <Cards
                        cardList={filteredTeacherList}
                        cardClassName={"teacher-card"}
                        onCardClick={name => setTeacherName(name)}
                        onAddBtnClick={() => {
                            setTeacherName("")
                        }}
                    />
                </div>
                <div className='right-sub-container'>
                    <DetailsContainer
                        activeTeacherName={teacherName}
                        teachersList={teachersList}
                        onSubmitCallBack={startUpFunction}

                        setDisplayLoader={setDisplayLoader}
                    />
                </div>
            </div>
            {displayLoader && <Loader />}
        </>
    )
}

interface DetailsContainerProps {
    activeTeacherName: string,
    teachersList: string[],
    onSubmitCallBack: () => void,

    setDisplayLoader: React.Dispatch<React.SetStateAction<boolean>>
}

const DetailsContainer: React.FC<DetailsContainerProps> = ({
    activeTeacherName = "",
    teachersList,
    onSubmitCallBack,

    setDisplayLoader
}) => {
    const [teacherName, setTeacherName] = useState<string>(activeTeacherName);
    const [teacherDetails, setTeacherDetails] = useState<Teacher>({
        freeTime: [],
        subjects: [],
    });
    const [disabled, setDisabled] = useState<boolean>(false)
    const subjectList = useRef<string[] | undefined>();

    useEffect(() => {
        setTeacherName(activeTeacherName)
        if (activeTeacherName === "") setTeacherDetails({ freeTime: [], subjects: [] })
        else getTeacher(activeTeacherName, setTeacherDetails); // api call
    }, [activeTeacherName])

    useEffect(() => {
        getSubjectsList(data => subjectList.current = data) // api call
    }, [])


    const updateTeacherFreeTimeDetails = useCallback((time: [number, number], active: boolean) => {
        let newDetails: Teacher = { ...teacherDetails };
        if (active) {
            let found = -1;
            for (let index = 0; index < newDetails.freeTime.length; index++) {
                if (newDetails.freeTime[index][0] === time[0] && newDetails.freeTime[index][1] === time[1]) {
                    found = index;
                    break
                }
            }
            newDetails.freeTime.splice(found, 1);
        } else {
            newDetails.freeTime[newDetails.freeTime.length] = time;
        }
        setTeacherDetails(newDetails)
    }, [teacherDetails])

    const inputOnChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.name === 'teacherName') setTeacherName(event.target.value.toUpperCase())
        else setTeacherDetails(value => ({ ...value, [event.target.name]: event.target.value }))
    }, [])

    const checkIfAlreadyExist = useCallback((teacher: string) => {
        if (hasElement(teachersList, teacher)) { } // if teacher exist show delete btn
        else { } // if not teacher exist show delete btn
    }, [teachersList])

    const teacherFormSubmitHandler = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //verification of inputs
        let verifiedData = verifyTeacherInputs(teacherName, teacherDetails, subjectList)
        if (verifiedData)
            if (hasElement(teachersList, verifiedData.newTeacherName)) { // checking if the teacher exsist or not
                if (window.confirm("Are you want to overwrite " + teacherName)) // if exist show a confirmation box
                    saveData(verifiedData.newTeacherName, verifiedData.teacherData); // if yes then save else do nothing
            } else saveData(verifiedData.newTeacherName, verifiedData.teacherData);
    }, [teacherName, teacherDetails, teachersList])

    const saveData = useCallback((teacherName: string, teacherData: Teacher) => {
        setDisplayLoader(true)
        setDisabled(true)
        saveTeacher(teacherName, teacherData, () => { // api call
            alert(JSON.stringify({ teacherName, teacherData }) + "---------- is added")
            onSubmitCallBack(); // referenced to start up function
        }).then(() => {
            setDisplayLoader(false)
            setDisabled(false)
        }).catch(() => {
            setDisplayLoader(false)
            setDisabled(false)
        })
    }, [])

    const deleteTeacherBtnClickHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (hasElement(teachersList, teacherName)) // checking if the teacher exsist or not
            if (window.confirm("Are you sure? Want to Delete " + teacherName + " ?")) { // if exist show a confirmation box
                deleteTeacher(teacherName, () => { // api call
                    onSubmitCallBack();  // referenced to start up function
                }, () => {
                    setDisplayLoader(false) // if failed only hide loader
                });
            }
    }, [teacherName])

    return (
        <form className='details-container' onSubmit={teacherFormSubmitHandler}>
            <div className='inputs-container-heading'>Details</div>
            <div className="input-container">
                <div className="input-box-heading">Teacher Name</div>
                <input
                    type="text"
                    className="input-box"
                    name='teacherName'
                    value={teacherName}
                    placeholder='Ex. ABC'
                    onChange={event => {
                        checkIfAlreadyExist(event.target.value.trim().toUpperCase())
                        inputOnChangeHandler(event)
                    }}></input>
            </div>
            <div className="input-container">
                <div className="input-box-heading">Subject Names</div>
                {subjectList.current && <TagInput
                    validTags={subjectList.current}
                    tagList={teacherDetails.subjects}
                    onChange={(data) => {
                        let newTeacherDetails = { ...teacherDetails, subject: data }
                        setTeacherDetails(newTeacherDetails)
                    }}
                />}
            </div>
            <div className='input-container'>
                <div>Available Times</div>
                <TimeSelector
                    onChange={updateTeacherFreeTimeDetails}
                    selectedValues={teacherDetails.freeTime} />
            </div>
            <div className='save-btn-container'>
                <button className='teacher-save-btn' type='submit' disabled={disabled} >Save</button>
                <button className='teacher-delete-btn' onClick={deleteTeacherBtnClickHandler}>Delete</button>
            </div>
        </form>
    )
}

interface TimeSelectorProps {
    onChange?: (time: [number, number], active: boolean) => void,
    selectedValues: [number, number][] | []
}

const TimeSelector: React.FC<TimeSelectorProps> = memo(({ onChange = () => { }, selectedValues = [] }) => {
    const [periodCount, setPeriodCount] = useState<number>(8);
    useEffect(() => {
        getTimeTableStructure((timeTableStructure) => { setPeriodCount(timeTableStructure.periodCount) }); // api call
    }, [])
    let noOfDays = 5;
    let timeTable = [];
    for (let day = 0; day < noOfDays; day++) {
        let selectedValuesOfThatDay: number[] = [];
        for (let index = 0; index < selectedValues.length; index++) {
            if (selectedValues[index][0] === (day + 1))
                selectedValuesOfThatDay.push(selectedValues[index][1])
        }
        timeTable.push(
            <Periods
                key={day}
                day={day}
                noOfPeriods={periodCount}
                activeIndexs={selectedValuesOfThatDay}
                onClick={onChange}
            ></Periods>
        )
    }
    return (
        <div className='time-selector'>
            <div className='time-table-container'>
                {timeTable}
            </div>
        </div>
    )
})

interface PeriodsProps {
    day: number,
    noOfPeriods: number,
    activeIndexs: number[],
    onClick?: (time: [number, number], active: boolean) => void,
}

const Periods: React.FC<PeriodsProps> = memo(({ noOfPeriods, day, onClick = () => { }, activeIndexs = [] }) => {
    let periods = []
    for (let period = 0; period < noOfPeriods; period++) {
        const active = hasElement(activeIndexs, (period + 1))
        periods.push(
            <div
                key={period}
                className={'period' + (active ? " selected" : "")}
                onClick={() => {
                    onClick([day + 1, period + 1], active)
                }}>
                {period + 1}
            </div>
        )
    }

    return (
        <div className='periods-container' >
            {periods}
        </div>
    )
})

export default memo(TeachersPage)