"use client";

import { FileUploader, FileInput } from "@/components/extension/file-upload";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { DropzoneOptions } from "react-dropzone";

const FileUploadDropzone = ({
	onFileUpload,
}: {
	onFileUpload: (file: File) => void;
}) => {
	const [file, setFile] = useState<File[] | null>([]);

	const dropzone: DropzoneOptions = {
		multiple: false,
		maxSize: 1 * 1024 * 1024,
		accept: { "text/csv": [".csv"] },
	};

	useEffect(() => {
		if (file && file.length > 0) {
			onFileUpload(file[0]); // Pass the first file to the parent component
		}
	}, [file, onFileUpload]);

	return (
		<FileUploader
			value={file}
			onValueChange={setFile}
			dropzoneOptions={dropzone}
		>
			<FileInput>
				<div className="flex flex-col gap-y-4 items-center justify-center h-44 w-full cursor-pointer rounded-lg bg-gray-500 bg-opacity-40 backdrop-contrast-100 backdrop-filter  backdrop-blur border border-white/20">
					<Upload className="" />
					{file?.length === 0 ? (
						<p className="mb-1 text-sm text-white">
							<span className="font-semibold">
								Click to upload
							</span>{" "}
							or drag and drop
						</p>
					) : (
						<p className="mb-1 text-sm text-white text-center">
							<span className="font-semibold">
								{file && file[0]?.name}
							</span>{" "}
							uploaded
						</p>
					)}
				</div>
			</FileInput>
		</FileUploader>
	);
};

export default FileUploadDropzone;
