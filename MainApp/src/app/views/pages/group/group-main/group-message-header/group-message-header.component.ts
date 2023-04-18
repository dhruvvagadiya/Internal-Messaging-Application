import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupMember } from 'src/app/core/models/Group/group-member';
import { Group } from 'src/app/core/models/GroupChat/group';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat-service';
import { GroupService } from 'src/app/core/service/group-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
    selector: 'group-message-header',
    templateUrl: 'group-message-header.component.html',
    styleUrls : ['group-message-header.component.scss']
})

export class GroupMessageHeaderComponent implements OnInit {
    constructor(
        private groupChatService : GroupChatService,
        private groupService : GroupService,
        private modalService: NgbModal,
        private signalrService : SignalrService,
        private userService : UserService,
        ) { }

    selectedGroup : Group
    memberList : GroupMember[] = []
    
    allContacts : LoggedInUser [];

    toBeRemoveUser : GroupMember;

    @Input() user : LoggedInUser;

    ngOnInit() {
        this.groupChatService.groupChanged.subscribe(e => {
            this.selectedGroup = e;

            if(this.selectedGroup){
                this.getMembers();
            }

            this.userService.getAll().subscribe((e : LoggedInUser[]) => {
                this.allContacts = e;
            });    
        });
    }

    getMembers(){
        this.groupService.getMembers(this.selectedGroup.id).subscribe((res : GroupMember []) => {
            this.memberList = res;
        });
    }

    leaveFromGroup(){
        this.groupService.leaveFromGroup({groupId : this.selectedGroup.id, userName : this.user.userName}).subscribe(() =>{});
        
        this.signalrService.leaveFromGroup(this.selectedGroup.id, this.user.userName);
        this.groupChatService.groupChanged.next(null);
    }

    removeMember(userName : string){
        this.groupService.removeMember(userName, this.selectedGroup.id).subscribe(e => {});
        this.memberList = this.memberList.filter(e => e.userName !== userName);
        this.signalrService.leaveFromGroup(this.selectedGroup.id, userName);
    }

    // back to chat-list for tablet and mobile devices
    backToChatList() {
        document.querySelector(".chat-content").classList.toggle("show");
    }

    getGroupProfile(url: string) {
        return this.groupChatService.getProfileUrl(url);
    }
    
    openDetailsModal(content: TemplateRef<any>){
        this.modalService.open(content, {centered: true, scrollable:true}).result.then((result) => {}).catch((err) => {});      
    }

    openAddParticipant(content: TemplateRef<any>){

        this.allContacts.forEach(element => {
            if(this.memberList.some(e => e.userName === element.userName)){
                element['disabled'] = true;
            }
        });

        this.modalService.open(content, {centered: true}).result.then((result) => {}).catch((err) => {});      
    }

    openUpdateModal(content: TemplateRef<any>) {        
        this.modalService.open(content, {}).result.then((result) => {}).catch((err) => {});
    }

    openBasicModal(content: TemplateRef<any>) {
        this.modalService.open(content, {}).result.then((result) => {}).catch((err) => {});
    }

    getProfile(url : string){
        return this.userService.getProfileUrl(url);
    }
}