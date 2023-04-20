import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GroupChatModel } from 'src/app/core/models/GroupChat/group-message-model';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { UserService } from 'src/app/core/service/user-service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-group-message-body',
    templateUrl: 'group-message-body.component.html',
    styleUrls : ['group-message-body.component.scss']
})

export class GroupMessageBodyComponent implements OnInit, AfterViewChecked {

    constructor(private userService:  UserService) { }

    @Input() messageList : GroupChatModel []
    @Output() replyMsgClicked = new EventEmitter<{id : number, content : string}>();
    
    user : LoggedInUser;

    ngOnInit() {
        this.userService.getUserSubject().subscribe(e => {
            this.user = e;
        });
    }

      //get profile url
    getProfile(url : string) {
        return this.userService.getProfileUrl(url);
    }

    getMsgUrl(filePath : string){
        return environment.hostUrl + "/groupChat/" + filePath;
    }

    //set reply msg id and content
    replyMsg(id: number, content: string) {        
        this.replyMsgClicked.emit({id, content});
    }

      //scroll msg after they are rendered on screen
    @ViewChild("scrollContainer") scrollContainer: ElementRef;
    ngAfterViewChecked(): void {
        try {
        this.scrollContainer.nativeElement.scrollTop =
            this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) {}
    }


}