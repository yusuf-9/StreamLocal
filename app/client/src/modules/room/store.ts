import type { Member, Message, RoomState } from "./types";

export default class Store {
  private _room: RoomState['room'];
  private _user: Member | null;
  private _isMobile: boolean;
  private _isLeftSidebarOpen: boolean;
  private _isRightSidebarOpen: boolean;
  private _isRoomLoaded: boolean;

  constructor() {
    this._room = {
      id: '',
      name: '',
      members: [],
      messages: [],
    };
    this._user = null;
    this._isMobile = window.innerWidth < 1024;
    this._isLeftSidebarOpen = false;
    this._isRightSidebarOpen = false;
    this._isRoomLoaded = false;
  }

  // Getters
  get room(): RoomState['room'] { return this._room; }
  get user(): Member | null { return this._user; }
  get isMobile(): boolean { return this._isMobile; }
  get isLeftSidebarOpen(): boolean { return this._isLeftSidebarOpen; }
  get isRightSidebarOpen(): boolean { return this._isRightSidebarOpen; }
  get isRoomLoaded(): boolean { return this._isRoomLoaded; }

  // Setters
  setRoom(room: Partial<RoomState['room']>) {
    this._room = { ...this._room, ...room };
  }

  setUser(user: Member | null) {
    this._user = user;
  }

  setRoomMembers(members: Member[]) {
    // Dedupe and sort members
    this._room.members = [...new Map(members.map(item => [item.id, item])).values()]
      .sort((a, b) => a.joinedAt - b.joinedAt);
  }

  addRoomMember(member: Member) {
    this.setRoomMembers([...this._room.members, member]);
  }

  updateRoomMember(userId: string, updates: Partial<Member>) {
    this._room.members = this._room.members.map(member => 
      member.id === userId ? { ...member, ...updates } : member
    );
  }

  getMember(userId: string): Member | undefined {
    return this._room.members.find(member => member.id === userId);
  }

  addMessage(message: Message) {
    this._room.messages.push(message);
  }

  setRoomLoaded(loaded: boolean) {
    this._isRoomLoaded = loaded;
  }

  setMobile(isMobile: boolean) {
    this._isMobile = isMobile;
  }

  toggleLeftSidebar() {
    this._isLeftSidebarOpen = !this._isLeftSidebarOpen;
  }

  toggleRightSidebar() {
    this._isRightSidebarOpen = !this._isRightSidebarOpen;
  }

  setMobileLeftSidebarOpen(isOpen: boolean) {
    this._isLeftSidebarOpen = isOpen;
  }

  setMobileRightSidebarOpen(isOpen: boolean) {
    this._isRightSidebarOpen = isOpen;
  }
}