use std::cmp::min;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use base64::Engine;
use aes_gcm::aead::{Aead, OsRng};
use aes_gcm::{AeadCore, Aes256Gcm, Key, KeyInit, Nonce};
use toml::Table;


#[tauri::command]
fn greet(name: &str) -> String {
    let x = encrypt(name,name);
    format!("Hello, {}! You've been greeted from Rust!", x)
}



#[tauri::command]
fn get_keys(text: &str) -> String {

    let value = text.parse::<Table>();
    if let Ok(value) = value {
        let mut list = vec![];
        for k in value {
            list.push(k.0);
        }
        list.join(",")
    } else {  
        "".to_string()
    } 
}

#[tauri::command]
fn find(toml:&str, text: &str, pw: &str) -> String {
   
    let value = toml.parse::<Table>().unwrap();
    for k in value {
        if k.0.contains(text) {
            println!("# {}", k.0);
            if let toml::Value::Table(table_value) = k.1 {
                let p = &table_value["p"];
                if let  toml::Value::String(p) = p {
                    let pp: Vec<&str> = p.split("|").collect();
                    let de = decrypt(pw,pp[0],pp[1]);
                   // println!("---  {}", de);
                    return  de;
                }

                for kv in table_value {
                    println!("{} : {}", kv.0, kv.1);
                }
            }
            // println!("site:{}; username:{}", k.0,k.1["n"]);
        }
    }
    "".to_string()
}





#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet,get_keys,find])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



/// key 密码
/// text 要加密的文本
pub fn encrypt(key: &str, text: &str) -> String {
    let key: &[u8; 32] = &u8_to_u832(key);
    let key: &Key<Aes256Gcm> = key.into();

    let key = Key::<Aes256Gcm>::from_slice(key);

    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits; unique per message
    let ciphertext = cipher.encrypt(&nonce, text.as_bytes().as_ref()).unwrap();
    let nonce_string = base64::engine::general_purpose::STANDARD.encode(nonce.to_vec());
    let base64_string = base64::engine::general_purpose::STANDARD.encode(&ciphertext);

    format!("{}|{}", nonce_string, base64_string)
    // return (base64_string,nonce_string);
}


fn decrypt(key: &str, nonce_base64_text: &str, base64_text: &str) -> String {
    let key: &[u8; 32] = &u8_to_u832(key);
    let key: &Key<Aes256Gcm> = key.into();

    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(&key);
    // let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits; unique per message

    let r = base64::engine::general_purpose::STANDARD.decode(base64_text);
    let nonce = base64::engine::general_purpose::STANDARD.decode(nonce_base64_text).unwrap();
    if let Ok(r) = r {
        let ciphertext = cipher.decrypt(Nonce::from_slice(&nonce), r.as_ref());
        if let Ok(ciphertext) = ciphertext {
            let x = String::from_utf8(ciphertext);
            if let Ok(x) = x {
                return x;
            }
        }
    }
    "".to_string()
}



fn u8_to_u832(str: &str) -> [u8; 32] {
    let bytes = str.as_bytes();
    let len = min(bytes.len(), 32usize);
    let mut u832: [u8; 32] = [0; 32];
    for i in 0..len {
        u832[i] = bytes[i];
    }
    u832
}