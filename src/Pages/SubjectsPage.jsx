import MiniStateContainer from '../Components/MiniStateContainer'
import Menubar from '../Components/Menubar'
import SearchBar from '../Components/SearchBar'
import Cards from '../Components/Cards'
import "../Style/Subjects.css"
import { useEffect, useState, useRef, memo, useCallback } from 'react'
import { deleteSubject, getSubjectDetails, getSubjectList, saveSubject } from '../Script/SubjectsDataFetcher'
import "../Script/commonJS"
import { hasElement } from '../Script/util'
import TagInput from '../Components/TagInput'
import OwnerFooter from '../Components/OwnerFooter'
import Loader from '../Components/Loader'

function SubjectsPage() {
    return (
        <>
            <Menubar activeMenuIndex={0} />
            <div className='main-container subjects'>
                <MainComponents />
                <OwnerFooter />
            </div>
        </>
    )
}

function MainComponents() {
    const [subjectsList, setSubjectsList] = useState([])
    const [subjectName, setSubjectName] = useState()
    const [displayLoader, setDisplayLoader] = useState(false);

    const subjectDeleteBtn = useRef()

    useEffect(() => {
        startUpFunction()
    }, [])
    const startUpFunction = useCallback(() => {
        getSubjectList(setSubjectsList)
        setSubjectName("")
        setDisplayLoader(false)
    }, [])
    const subjectCardOnClickHandler = useCallback((event) => {
        setSubjectName(event.target.title)
        subjectDeleteBtn.current.style.cssText = "display: block";
    }, [])
    const addSubjectCardClickHandler = useCallback(() => {
        setSubjectName("")
        subjectDeleteBtn.current.style.cssText = "display: none;";
    }, [])
    return (
        <>
            <Loader display={displayLoader} />
            <div className='top-sub-container'>
                <div className='left-sub-container'>
                    <div className='tools-container'>
                        <MiniStateContainer callBackAfterStateUpdate={startUpFunction} />
                        <SearchBar />
                    </div>
                    <Cards
                        cardDetails={subjectsList}
                        cardClassName={"subject-card"}
                        cardClickHandler={subjectCardOnClickHandler}
                        addBtnClickHandler={addSubjectCardClickHandler} />
                </div>
                <div className='right-sub-container'>
                    <DetailsContainer
                        outerSubjectName={subjectName}
                        subjectsList={subjectsList}
                        onSubmitCallBack={startUpFunction}

                        subjectDeleteBtnRef={subjectDeleteBtn}
                        setDisplayLoader={setDisplayLoader}
                    />
                </div>
            </div>
        </>
    )
}

function DetailsContainer({
    outerSubjectName = "",
    subjectsList,
    onSubmitCallBack,

    subjectDeleteBtnRef,
    setDisplayLoader
}) {
    const [subjectName, setSubjectName] = useState('')
    const [subjectDetails, setSubjectDetails] = useState({
        isPractical: false,
        lectureCount: 4,
        roomCodes: [],
        sem: ""
    })
    useEffect(() => {
        if (!outerSubjectName) {
            setSubjectName("")
            setSubjectDetails({
                isPractical: false,
                lectureCount: 4,
                roomCodes: [],
                sem: ""
            })
        } else {
            setSubjectName(outerSubjectName)
            getSubjectDetails(outerSubjectName, setSubjectDetails)
        }
    }, [outerSubjectName])
    const subjectTypeClickHandler = useCallback((event) => {
        let checkbox = event.target;
        let isLab = false;
        if (hasElement(event.target.classList, "active")) {
            checkbox.classList.remove("active");
            isLab = false;
        } else {
            checkbox.classList.add("active");
            isLab = true;
        }
        setSubjectDetails(value => ({ ...value, isPractical: isLab }))
    }, [])
    const inputOnChangeHandler = useCallback((event) => {
        if (event.target.name === 'subjectName') setSubjectName(event.target.value.toUpperCase())
        else setSubjectDetails(value => ({ ...value, [event.target.name]: event.target.value }))
    }, [subjectDetails])
    const checkIfAlreadyExist = useCallback((teacher) => {
        if (hasElement(subjectsList, teacher)) subjectDeleteBtnRef.current.style.cssText = "display: block;";
        else subjectDeleteBtnRef.current.style.cssText = "display: none;";
    }, [subjectsList])
    const subjectFormSubmitHandler = useCallback((event) => {
        event.preventDefault();
        let data = { ...subjectDetails }
        let newSubjectName = subjectName.trim().toUpperCase()

        //form validating
        if (newSubjectName.length > 100) {
            alert("Length of the name must be less than 100");
            return false;
        }
        if (newSubjectName.length === 0) {
            alert("Please Enter a vaild name");
            return false;
        }
        //sem validation
        if (data.sem.length === 0) {
            alert("Please Enter a Number in semester");
            return false;
        }
        if (parseInt(data.sem)) {
            data.sem = parseInt(data.sem);
        } else {
            alert("Please Enter a number in semester");
            return false;
        }
        if (data.sem < 1 || data.sem > 8) {
            alert("Value must be in 1 to 8 range in semester");
            return false;
        }
        //lecture count validation
        if (data.lectureCount === 0 || data.lectureCount === "") {
            data.lectureCount = 4;
        }
        if (parseInt(data.lectureCount)) {
            data.lectureCount = parseInt(data.lectureCount);
        } else {
            alert("Please Enter a number in lecture count per week");
            return false;
        }
        if (data.lectureCount < 0 || data.lectureCount > 40) {
            alert("Value must be in range 0 to 40 in lecture count per week");
            return false;
        }
        //room code validation
        if (data.roomCodes.length === 0) {
            alert("Please Enter a Classroom name");
            return false;
        }

        try {
            let temp_rCode = [];
            for (let index = 0; index < data.roomCodes.length; index++) {
                temp_rCode.push(data.roomCodes[index].trim().toUpperCase())
            }
            data.roomCodes = temp_rCode;
        } catch (err) {
            alert("Please Enter a Valid Room Code");
            return false
        }
        if (hasElement(subjectsList, newSubjectName)) {
            if (window.confirm("Are you want to overwrite " + newSubjectName))
                saveData(newSubjectName, data);
        } else saveData(newSubjectName, data);
    }, [subjectName, subjectDetails, subjectsList])
    const saveData = useCallback((subjectName, subjectData) => {
        setDisplayLoader(true)
        let newData = new Map();
        newData[subjectName] = subjectData;
        saveSubject(newData, () => {
            alert(JSON.stringify(newData) + "---------- is added");
            onSubmitCallBack();
        }, () => {
            setDisplayLoader(false)
        })
    }, [])
    const deleteSubjectBtnClickHandler = useCallback((event) => {
        event.preventDefault();
        if (hasElement(subjectsList, subjectName))
            if (window.confirm("Are You Sure? Want to Delete " + subjectName + " ?"))
                deleteSubject(subjectName, () => {
                    onSubmitCallBack();
                    subjectDeleteBtnRef.current.style.cssText = "display: none;";
                }, () => {
                    setDisplayLoader(false)
                })
    }, [subjectName])
    return (
        <form className='details-container' onSubmit={subjectFormSubmitHandler}>
            <div className='inputs-container-heading'>Details</div>
            <div className="input-container">
                <div className="input-box-heading">Subject Name</div>
                <input
                    type="text"
                    className="input-box"
                    name='subjectName'
                    value={subjectName}
                    placeholder='Ex. ABC'
                    onChange={event => {
                        checkIfAlreadyExist(event.target.value.trim().toUpperCase())
                        inputOnChangeHandler(event)
                    }}></input>
            </div>
            <div className="input-container">
                <div className="input-box-heading">Semester</div>
                <input
                    type="number"
                    className="input-box"
                    name='sem'
                    value={subjectDetails.sem}
                    placeholder='Ex. 8'
                    onChange={event => {
                        inputOnChangeHandler(event)
                    }}
                    min={1}
                    max={8}></input>
            </div>
            <div className="input-container">
                <div className="input-box-heading">Lecture Count per Week (Value: {subjectDetails.lectureCount})</div>
                <input
                    type="range"
                    className="input-box"
                    name='lectureCount'
                    max={40}
                    min={0}
                    value={subjectDetails.lectureCount}
                    title={subjectDetails.lectureCount}
                    onChange={event => {
                        inputOnChangeHandler(event);
                    }}></input>
            </div>
            <div className="input-container">
                <div className="input-box-heading">Classroom</div>
                <TagInput
                    inputName={'roomCodes'}
                    details={subjectDetails}
                    updateWithNewValues={(data) => {
                        let newSubjectDetails = { ...subjectDetails }
                        newSubjectDetails.roomCodes = data;
                        setSubjectDetails(newSubjectDetails)
                    }}
                />
            </div>
            <div className="input-container">
                <div className="input-box-heading">Subject Type (On if Sub. is Practical)</div>
                <div className={'box ' + (subjectDetails.isPractical ? "active" : "")} name="isPractical" onClick={subjectTypeClickHandler}>
                    <div className='dot'></div>
                </div>
            </div>
            <div className='save-btn-container'>
                <button className='subject-save-btn' type='submit'>Save</button>
                <button className='subject-delete-btn' onClick={deleteSubjectBtnClickHandler} ref={subjectDeleteBtnRef}>Delete</button>
            </div>
        </form>
    )
}

export default memo(SubjectsPage)