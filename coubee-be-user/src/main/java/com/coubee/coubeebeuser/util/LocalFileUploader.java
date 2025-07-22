package com.coubee.coubeebeuser.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
public class LocalFileUploader implements FileUploader {

    private static final String BASE_DIR = "src/main/resources/static/image";

    @Override
    public String upload(MultipartFile file, String dirName) {
        String fileName = dirName + "/" + UUID.randomUUID() + getExtension(file.getOriginalFilename());
        File dest = new File(BASE_DIR + "/" + fileName);
        dest.getParentFile().mkdirs();

        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("로컬 파일 업로드 실패", e);
        }

        return "/image/" + fileName; // 클라이언트 접근 경로
    }

    @Override
    public void delete(String fileUrl) {
        String path = "src/main/resources/static" + fileUrl; // ex: /image/xxx.png
        File file = new File(path);
        if (file.exists()) {
            file.delete();
        }
    }

    private String getExtension(String filename) {
        return filename.substring(filename.lastIndexOf("."));
    }
}