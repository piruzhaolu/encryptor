// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    encryptor_tauri_lib::run()
}




// 测试模块
#[cfg(test)]
mod tests {

    #[test]
    fn test_encrypt() {
        let text = "";
        let password = "";
        let encrypted = encryptor_tauri_lib::encrypt(text, password);
        println!("Encrypted: {}", encrypted);
        
    }
}