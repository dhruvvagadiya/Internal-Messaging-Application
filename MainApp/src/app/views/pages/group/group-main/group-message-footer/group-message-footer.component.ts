import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Group } from 'src/app/core/models/Group/group';
import { GroupChatModel } from 'src/app/core/models/GroupChat/group-message-model';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AudioRecordingService } from 'src/app/core/service/audio-record.service';
import { GroupChatService } from 'src/app/core/service/group-chat.service';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
    selector: 'app-group-message-footer',
    templateUrl: 'group-message-footer.component.html',
    styleUrls : ['group-message-footer.component.scss']
})

export class GroupMessageFooterComponent implements OnInit {
    constructor(
        private userService : UserService,
        private groupChatService : GroupChatService,
        private signalrService : SignalrService,
        private modalService : NgbModal,
        private audioRecordingService : AudioRecordingService,
        private sanitizer: DomSanitizer,
        
    ) { }

    @Input() replyMsgId : number
    @Input() replyMsgContent : string

    file : File
    user : LoggedInUser
    selectedGroup : Group

    ngOnInit() {
      this.userService.getUserSubject().subscribe(e => {
          this.user = e;
      });

      this.groupChatService.groupChanged.subscribe(e => {
          this.selectedGroup = e;    
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

      //send message
  sendMessage(event: HTMLInputElement) {

    //if there is not input and also no file uploaded
    if(event.value.length === 0 && this.file === null){
      return;
    }

    const formData = new FormData();

    if(this.file){
      formData.append('file', this.file);
    }
    formData.append('type', this.file ? 'file' : 'text');
    formData.append('content', event.value);
    formData.append('groupId', '' + this.selectedGroup.id);


    if(this.replyMsgId){
      formData.append('repliedTo', '' + this.replyMsgId);
    }
    

    this.groupChatService
      .sendChat(this.selectedGroup.id, formData)
      .subscribe(
        (res: GroupChatModel) => {
          
          //generate event to send msg to receiver
          if(this.signalrService.hubConnection){
            this.signalrService.sendGroupMessage(res, this.selectedGroup.name);
            this.signalrService.updateRecentGroup(this.selectedGroup, res);
          }

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

  closeMsgAndFile(){
    this.file = null;
    this.replyMsgId = null;
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


  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, {}).result.then((result) => {}).catch((err) => {});
  }

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
      formData.append("type", "file");
      formData.append('groupId', '' + this.selectedGroup.id);
      
      if (this.replyMsgId) {
        formData.append("repliedTo", "" + this.replyMsgId);
      }

      this.groupChatService
      .sendChat(this.selectedGroup.id, formData)
      .subscribe(
        (res: GroupChatModel) => {
          
          //generate event to send msg to receiver
          if(this.signalrService.hubConnection){
            this.signalrService.sendGroupMessage(res, this.selectedGroup.name);
            this.signalrService.updateRecentGroup(this.selectedGroup, res);
          }

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