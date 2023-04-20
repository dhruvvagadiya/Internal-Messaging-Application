import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupMember } from 'src/app/core/models/Group/group-member';
import { Group } from 'src/app/core/models/Group/group';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat-service';
import { GroupService } from 'src/app/core/service/group-service';
import { UserService } from 'src/app/core/service/user-service';
import { SignalrService } from 'src/app/core/service/signalR-service';

@Component({
    selector: 'app-group-message-header',
    templateUrl: 'group-message-header.component.html',
    styleUrls : ['group-message-header.component.scss']
})

export class GroupMessageHeaderComponent implements OnInit {
    constructor(
        private groupChatService : GroupChatService,
        private groupService : GroupService,
        private modalService: NgbModal,
        private userService : UserService,
        private signalrService : SignalrService
        ) { }

    selectedGroup : Group
    memberList : GroupMember[] = []
    
    allContacts : LoggedInUser [];

    toBeRemoveUser : GroupMember;
    user : LoggedInUser;

    ngOnInit() {

        this.userService.getUserSubject().subscribe(e => {
            this.user = e;
        });

        this.groupChatService.groupChanged.subscribe(e => {
            this.selectedGroup = e;

            if(this.selectedGroup){
                this.getMembers();
            }

            this.userService.getAll().subscribe((e : LoggedInUser[]) => {
                this.allContacts = e;
            });    
        });

        //member is removed or left from group -> remove from member list
        this.signalrService.hubConnection.on("leaveFromGroup", (groupId : number, userName : string) => {
            if(this.selectedGroup?.id === groupId){
                this.memberList = this.memberList.filter(e => e.userName !== userName);

                if(this.user.userName === userName){
                    this.groupChatService.groupChanged.next(null);
                }
            }
        });

        //if new members are added then modify list
        this.signalrService.hubConnection.on("updateMemberList", (groupId : number, newMembers : GroupMember[]) => {
            if(this.selectedGroup?.id === groupId){
                this.memberList = this.memberList.concat(newMembers);
            }
        });
    }

    getMembers(){
        this.groupService.getMembers(this.selectedGroup.id).subscribe((res : GroupMember []) => {
            this.memberList = res;
        });
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
            else{
                element['disabled'] = false;
            }
        });

        this.modalService.open(content, {centered: true}).result.then((result) => {}).catch((err) => {});      
    }

    openBasicModal(content: TemplateRef<any>) {
        this.modalService.open(content, {}).result.then((result) => {}).catch((err) => {});
    }

    getProfile(url : string){
        return this.userService.getProfileUrl(url);
    }
}