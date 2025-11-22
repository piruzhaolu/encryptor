buildscript {
    repositories {
        maven(url = "https://maven.aliyun.com/repository/central")
         maven(url = "https://maven.aliyun.com/repository/public")
         maven(url = "https://maven.aliyun.com/repository/jcenter")
         maven(url = "https://maven.aliyun.com/repository/google")
         maven(url = "https://maven.aliyun.com/repository/releases")
         maven(url = "https://maven.aliyun.com/repository/snapshots")
         maven(url = "https://maven.aliyun.com/repository/gradle-plugin")
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.5.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
    }
}

allprojects {
    repositories {
        maven(url = "https://maven.aliyun.com/repository/central")
         maven(url = "https://maven.aliyun.com/repository/public")
         maven(url = "https://maven.aliyun.com/repository/jcenter")
         maven(url = "https://maven.aliyun.com/repository/google")
         maven(url = "https://maven.aliyun.com/repository/releases")
         maven(url = "https://maven.aliyun.com/repository/snapshots")
         maven(url = "https://maven.aliyun.com/repository/gradle-plugin")
        google()
        mavenCentral()
    }
}


tasks.register("clean").configure {
    delete("build")
}

