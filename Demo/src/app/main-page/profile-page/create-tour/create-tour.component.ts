import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataService, UtilityService, NotificationService, CommonService } from '../../../shared/service';
import { TourPost } from '../../../shared/domain/tourPost.user';
import { SystemConstants } from '../../../shared/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CreateNewAutocompleteGroup, SelectedAutocompleteItem, NgAutocompleteComponent } from "ng-auto-complete";
import { InfoContstants } from "../../../shared/common"
@Component({
  selector: 'app-create-tour',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './create-tour.component.html',
  styleUrls: ['./create-tour.component.css']
})
export class CreateTourComponent implements OnInit {
  @ViewChild(NgAutocompleteComponent)
  public completer: NgAutocompleteComponent;
  linkRefShow: boolean = false;
  public group = [
    CreateNewAutocompleteGroup(
      'Chặng đầu',
      'start',
      InfoContstants.CITY_VN,
      { titleKey: 'title', childrenKey: null },
      // '',
      // false
    ),
    CreateNewAutocompleteGroup(
      'Chặng cuối',
      'end',
      InfoContstants.CITY_VN,
      { titleKey: 'title', childrenKey: null },
      // '',
      // false
    ),
    CreateNewAutocompleteGroup(
      'Thể Loại',
      'category',
      InfoContstants.CATEGORY,
      { titleKey: 'title', childrenKey: null },
      '',
      false
    )
  ];
  listDay: any = [];
  user: any = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));
  groupTour: any = {};
  changeText: boolean = false;
  place: any = {
    '1': 'Ha'
  }
  id = 0;
  constructor(
    private dataService: DataService,
    private utiliService: UtilityService,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    for (let i = 1; i < 100; i++) {
      this.listDay.push({ title: i + ' ngày ' + (i - 1) + ' đêm', id: i });
    }
    this.group.push(
      CreateNewAutocompleteGroup(
        'Số ngày đêm',
        'duration',
        this.listDay,
        { titleKey: 'title', childrenKey: null },
        // '',
        // false
      )
    );
    this.activatedRoute.params.subscribe((params: Params) => {
      this.groupTour = {};
      this.id = params.id;
      if (params.id != 0) {
        this.changeText = true;
        this.dataService.get('/tours/post/' + params.id).subscribe((response: any) => {
          this.groupTour = response;
          this.groupTour.startPlaceID != undefined ? this.completer.SelectItem('start', this.groupTour.startPlaceID) : null;
          this.groupTour.endPlaceID != undefined ? this.completer.SelectItem('end', this.groupTour.endPlaceID) : null;
          this.groupTour.category != undefined ? this.completer.SelectItem('category', this.groupTour.category) : null;
          this.groupTour.duration != undefined ? this.completer.SelectItem('duration', this.groupTour.duration) : null;
        })
      } else {
        this.groupTour = { 'tourArticleTitle': '', 'description': '', 'prepare': '', 'note': '', 'startTime': '' };
      }
    });
  }

  ngOnInit() {
  }

  showGroupTour() {
    // console.log(this.groupTour);
  }
  validateGroupTour() {
    for (let i in this.groupTour) {
      // console.log(this.groupTour[i]);
      switch (i) {
        case 'tourArticleTitle':
          if (InfoContstants.isEmpty(this.groupTour[i])) {
            this.notifyService.printErrorMessage('Ô tiêu đề không nên để trống');
            return false;
          }
          break;
        case 'description':
          if (InfoContstants.isEmpty(this.groupTour[i])) {
            this.notifyService.printErrorMessage('Ô miêu tả không nên để trống');
            return false;
          }
          break;
        case 'prepare':
          if (InfoContstants.isEmpty(this.groupTour[i])) {
            this.notifyService.printErrorMessage('Ô chuẩn bị không nên để trống');
            return false;
          }
          break;
        case 'note':
          if (InfoContstants.isEmpty(this.groupTour[i])) {
            this.notifyService.printErrorMessage('Ô chú ý không nên để trống');
            return false;
          }
          break;
        case 'startTime':
          if (InfoContstants.isEmpty(this.groupTour[i])) {
            this.notifyService.printErrorMessage('Thời gian bắt đầu không nên để trống');
            return false;
          }
          break;
      }
    }
    return true;
  }
  saveGroupTour() {
    if (this.validateGroupTour()) {
      let exists: boolean = false;
      if (!InfoContstants.isEmpty(this.groupTour)) {
        let date = Date.now();
        let _groupTour: TourPost = new TourPost(0, this.user.id, this.groupTour.startPlaceID, this.groupTour.endPlaceID, this.groupTour.duration, this.groupTour.tourArticleTitle, 0,
          date, this.groupTour.description, 0, this.groupTour.note, this.groupTour.prepare, 1, this.groupTour.startTime, this.groupTour.category, this.groupTour.referenceLink);
        if (this.id == 0) {
          this.commonService.getAllTourPost(data => {
            data.forEach(element => {
              if (element.tourArticleTitle == _groupTour.tourArticleTitle) {
                exists = true;
              }
            });
            if (!exists) {
              this.commonService.createPost(_groupTour, data => {
                this.notifyService.printSuccessMessage("Tạo chuyến đi thành công");
                let _joinGroup = {
                  'tourPostID': data._body,
                  'joinGroupByID': this.user.id,
                  'deleted': 0,
                  'createTime': Date.now()
                }
                this.commonService.joinGroup(_joinGroup, data => {
                })
                this.utiliService.navigate('/main/profile/0');
              })
            } else {
              this.notifyService.printErrorMessage("Tiêu đề chuyến đi đã tồn tại, xin vui lòng thử lại")
            }
          })
        } else {
          _groupTour.id = this.id;
          this.commonService.updatePost(_groupTour, data => {
            this.notifyService.printSuccessMessage("Cập nhật chuyến đi thành công");
            this.utiliService.navigate('/main/profile/0');
          })
        }
      } else {
        this.notifyService.printErrorMessage('Dữ liệu chưa được nhập!');
      }
    }
  }

  deleteTourPost() {
    if (this.id == 0) {
      if (!InfoContstants.isEmpty(this.groupTour)) {
        this.notifyService.printConfirmationDialog('Bạn đã nhập dữ liệu, vậy bạn có muốn hủy bản nháp này!', () => {
          this.groupTour = { 'tourArticleTitle': '', 'description': '', 'prepare': '', 'note': '', 'startTime': '' };
        });
      } else {
        this.notifyService.printErrorMessage('Bạn chưa nhập dữ liệu');
      }
    } else {
      this.notifyService.printConfirmationDialog('Bạn có chắc chắn muốn xóa chuyến đi này!', () => {
        this.groupTour.deleted = 1;
        this.commonService.updatePost(this.groupTour, data => {
          this.utiliService.navigate('/main/profile/0');
        })
      });
    }
  }

  Selected(item: SelectedAutocompleteItem) {
    // console.log(item);
    switch (item.group.key) {
      case 'start':
        this.groupTour.startPlaceID = item.item.id;
        break;
      case 'end':
        this.groupTour.endPlaceID = item.item.id;
        break;
      case 'category':
        this.groupTour.category = item.item.id;
        break;
      case 'duration':
        this.groupTour.duration = item.item.id;
        break;
    }
  }

}
