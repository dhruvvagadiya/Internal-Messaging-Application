import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AudioRecordingService } from 'src/app/core/service/audio-record.service';
import { ChatService } from 'src/app/core/service/chat.service';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: "app-chat-message-footer",
  templateUrl: "chat-message-footer.component.html",
  styleUrls: ["chat-message-footer.component.scss"],
})
export class ChatMessageFooterComponent implements OnInit {
  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private signalrService: SignalrService,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private modalService : NgbModal
  ) {}

  @Input() replyMsgId: number;
  @Input() replyMsgContent: string;
  @Input() selectedUser: LoggedInUser;

  user: LoggedInUser;
  file: File;

  ngOnInit() {
    this.userService.getUserSubject().subscribe((e) => {
      this.user = e;
    });


    //for audio
    this.audioRecordingService
      .recordingFailed()
      .subscribe(() => (this.isRecording = false));

    this.audioRecordingService
      .getRecordedTime()
      .subscribe(time => (this.recordedTime = time));
      
    this.audioRecordingService.getRecordedBlob().subscribe(data => {
      this.teste = data;
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(data.blob)
      );
    });

  }

  //get profile url
  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user.imageUrl);
  }

  //send message
  sendMessage(event: HTMLInputElement) {
    //if there is not input and also no file uploaded
    if (event.value.length === 0 && this.file === null) {
      return;
    }

    const formData = new FormData();

    if (this.file) {
      formData.append("file", this.file);
    }
    formData.append("receiver", this.selectedUser.userName);
    formData.append("type", this.file ? "file" : "text");
    formData.append("content", event.value);

    if (this.replyMsgId) {
      formData.append("repliedTo", "" + this.replyMsgId);
    }

    this.chatService.sendChat(formData).subscribe(
      () => {
        this.signalrService.hubConnection.invoke('GetRecentChat', this.user.userName, this.selectedUser.userName);
      },
      (err) => {
        console.log(err);
      }
    );

    this.replyMsgId = null;
    event.value = "";
    this.file = null;
  }

  //add file to form at each change
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
  }

  addEmoji(event, messageInput : HTMLInputElement){
    const text = messageInput.value + event.emoji.native;
    messageInput.value = text;
    this.showEmojiPicker = false;
  }

  showEmojiPicker = false;
  toggleEmojiPicker(messageInput : HTMLInputElement){
    messageInput.focus();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  
  closeMsgAndFile(){
    this.file = null;
    this.replyMsgId = null;
  }


  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, {}).result.then((result) => {}).catch((err) => {});
  }

  // ************************************************************************************************************
  //for audio
  
  isRecording = false;
  recordedTime;
  blobUrl;
  teste;

  startRecording() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
    }
  }

  clearRecordedData() {
    this.blobUrl = null;
  }

  sendRecordedAudio(){

      const formData = new FormData();

      const fileName = "example.mp3"; // The name you want to give the file
      const file = new File([this.teste.blob], fileName, { type: this.teste.blob.type }); 

      formData.append('file', file);
      formData.append("sender", this.user.userName);
      formData.append("receiver", this.selectedUser.userName);
      formData.append("type", "file");
      
      if (this.replyMsgId) {
        formData.append("repliedTo", "" + this.replyMsgId);
      }
  
      this.chatService.sendChat(formData).subscribe(
        () => {
          this.signalrService.hubConnection.invoke('GetRecentChat', this.user.userName, this.selectedUser.userName);
        },
        (err) => {
          console.log(err);
        }
      );
  
      this.replyMsgId = null;
      this.file = null;

      this.clearRecordedData();
  }
}