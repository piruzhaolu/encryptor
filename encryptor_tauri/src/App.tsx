import {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import {BaseDirectory, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import { writeText } from '@tauri-apps/plugin-clipboard-manager'; //readText
import { message ,confirm} from '@tauri-apps/plugin-dialog';
import CloseIcon from '@mui/icons-material/Close';
import {
    Autocomplete, Box,
    Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, styled,
    TextField
} from "@mui/material";

function App() {
    const [toml, setToml] = useState("");
    const [pwkeys, setPwkeys] = useState([""]);
    const [platform, setPlatform] = useState<string | null>(null);
    const [pw, setPw] = useState<string>("");
    const [buttonText, setButtonText] = useState("Decode");
    const [open, setOpen] = useState(false);
    const editableRef = useRef();
    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    //     setGreetMsg(await invoke("greet", {name}));
    // }


    async function writeTomlFile(fileContent: string) {
        await writeTextFile("pw.toml", fileContent, {baseDir: BaseDirectory.AppLocalData});
        // let xx = await readTextFile("pw.toml", {baseDir: BaseDirectory.AppLocalData});
        // console.log(xx);
    }

    async function readTomlFile() {
        let tomlText = await readTextFile("pw.toml", {baseDir: BaseDirectory.AppLocalData});
        setToml(tomlText);
        let keys: string = await invoke("get_keys", {text: tomlText});
        let keysArray = keys.split(",");
        setPwkeys(keysArray);
        console.log(pwkeys);
    }

    //readTomlFile().then();
    useEffect(() => {
        if (toml === "") {
            readTomlFile().then();
        }
    });

    async function decode() {
        // if (platform === null || platform == "") {
        //     if (pw === "" || pw === null) {
        //         setButtonText("SetToml");
        //     } else {
        //         setButtonText("Encode");
        //     }
        // } else {
        //     setButtonText("Decode");
        // }
        
        if (platform === null || platform == "") {
            handleClickOpen();
            return;
        }
        let result: string = await invoke("find", {toml: toml, text: platform, pw: pw});
     
        if (result !== "") {
            await writeText(result);
            await message("密码已复制到剪贴板", {
                title: 'Password',
                kind: 'warning',
            });
        }
    }

    const BootstrapDialog = styled(Dialog)(({ theme }) => ({
        '& .MuiDialogContent-root': {
            padding: theme.spacing(2),
        },
        '& .MuiDialogActions-root': {
            padding: theme.spacing(1),
        },
    }));

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    


    async function handleSave() {
        let htmlDiv:HTMLElement = editableRef.current as unknown as HTMLElement;
        let newToml = htmlDiv?.innerText;
        
        if (newToml !== null && newToml !== undefined) {
            if (toml != "") {
                const answer = await confirm('覆盖当前Toml文件?', {
                    title: 'Toml',
                    kind: 'warning',
                });
                if (answer) {
                    await writeTomlFile(newToml);
                    await readTomlFile();
                }
            } else {
                await writeTomlFile(newToml);
                await readTomlFile();
            }
        }
        setOpen(false);
    }


    useEffect(() => {
        if (platform === null || platform == "") {
            if (pw === "" || pw === null) {
                setButtonText("SetToml");
            } else {
                setButtonText("Encode");
            }
        } else {
            setButtonText("Decode");
        }
    }, [platform,pw]); // 当 count 更新时触发
    


    return (
        <Box
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems="left"
            height="90vh" width={400}>

            <Autocomplete
                disablePortal
                options={pwkeys || null}
                sx={{width: 400}}
                value={platform || null}
                onChange={(_, newValue) => {
                    setPlatform(newValue);
                }}
                renderInput={(params) => <TextField {...params} label="平台"/>}
            />
            <TextField
                id="outlined-password-input"
                label="Password"
                type="password"
                value={pw || ""}
                onChange={(e) => {
                    setPw(e.currentTarget.value);
                }}
            />
            <Button variant="contained" onClick={decode}>{buttonText}</Button>

            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Toml
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers contentEditable={true} sx={{width:'400px',height:'200px', outline:'none'}} ref={editableRef}>
                    
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleSave}>
                        Save changes
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}

export default App;
