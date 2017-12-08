import { Component, OnInit, Renderer2 } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { UtilityService } from '../../shared/service/utility.service';
import { UrlConstants } from '../../shared/common/url.constants';
import { NotificationService } from '../../shared/service/notification.service';
import { AuthenService } from '../../shared/service/authen.service';
import { DataService } from '../../shared/service/data.service';
import { CommonService } from '../../shared/service/common.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { debug } from 'util';
import { TourPost } from '../../shared/domain/tourPost.user';
import { Like } from '../../shared/domain/like.user';
import { Comment } from '../../shared/domain/comment.user';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-tour-post-page',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tour-post-page.component.html',
  styleUrls: ['./tour-post-page.component.css']
})

export class TourPostPageComponent implements OnInit, OnDestroy {

  user: any = this.authentication.getLoggedInUser();
  tourPostId: string;
  tourPost: any = { 'liked': false, 'likedID': 0, 'countLiked': 0, 'bookmark': false };
  tourByDay: any;
  tourByDayDetail: any = [];
  statusComment: boolean = true;
  statusReport: boolean = true;
  hideForm: boolean = true;
  comment: string = "";
  report: any;
  randomIndex : any;
  listPlace: any = ['Ha Noi',
    'Da Nang',
    'Sai Gon',
    'Quang Ninh',
    'Hai Phong',
    'Bac Lieu',
    'Nha Trang'];
  textArray = [
    'red',
    'blue',
    'purple',
    'green',
  ];
  listComment: any;

  public tourpostId: number;

  constructor(
    private utilityService: UtilityService,
    private notifyService: NotificationService,
    private authentication: AuthenService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private renderer: Renderer2
  ) {
    // let localData = JSON.parse(localStorage.getItem('tourPost'));
    this.activatedRoute.params.subscribe((params: Params) => {
      this.tourPostId = params.id;
      this.dataService.get('/tours/post/' + params.id).subscribe((response: any) => {
        this.tourPost = response;
        this.tourPost.postViewNumber += 1;
        this.commonService.updatePost(this.tourPost, data => {
        });
        this.dataService.get('/tours/post/' + response.id + '/like/get-all').subscribe((response: any) => {
          this.tourPost["countLike"] = response.filter(item => item.deleted == 0).length;
          if (response != null) {
            if (this.user && response.findIndex(item => item.likeByID === this.user.id && item.deleted == 0) != -1) {
              this.tourPost.liked = true;
              this.tourPost.likedID = response[response.findIndex(item => item.likeByID === this.user.id)].id;
            } else if (this.user && response.findIndex(item => item.likeByID === this.user.id && item.deleted == 1) != -1) {
              this.tourPost.liked = true;
              this.tourPost.likedID = 0
            } else {
              this.tourPost.liked = false;
            }
          }
        }, error => {
        });
        this.commonService.getTourByDayDetails(response.id, data => {
          for (let i in data) {
            this.tourByDayDetail.push(data[i]);
          }
        });
        this.commonService.getAccountDetailsInfo(this.tourPost.accountID, data => {
          this.tourPost['author'] = data.firstName + ' ' + data.lastName;
        });

        this.commonService.getAccountInfo(this.tourPost.accountID, data => {
          this.tourPost['authorID'] = data.id;
          this.tourPost['level'] = data.level;
        });
      }, error => {
      });
    });
  }

  ngOnInit() {
    this.randomIndex = Math.floor(Math.random() * this.textArray.length);
    this.renderer.addClass(document.body, 'body-' + this.textArray[this.randomIndex]);
  }
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'body-'+ this.textArray[this.randomIndex]);
  }
  nagivateProfile() {
    this.utilityService.navigate(UrlConstants.PROFILE);
  }
  showPersonalInfo() {
    this.utilityService.navigate('/main/profile/' + this.tourPost.authorID);
  }
  
  bookMark(tourPost: any) {
    if (this.user != null) {
      let _bookmark = {
        'tourPostID': tourPost.id,
        'accountID': this.user.id,
        'deleted': 0,
        'createdTime': Date.now()
      };
      this.dataService.post('/user/account/' + this.user.id + '/Marking/', _bookmark).subscribe((response: any) => {
        console.log(response);
      }, error => {
      });
      this.notifyService.printSuccessMessage('Lưu bài viết thành công!');
    } else if (this.user != null && tourPost.liked) {

    } else {
      this.notifyService.printErrorMessage('Xin hãy đăng nhập trước khi thực hiện hành động này!');
    }
  }

  sendComment() {
    if (this.user != null) {
      let _comment = new Comment(this.comment, this.tourPost.id, this.user.id);
      this.dataService.post('/tours/post/' + this.tourPost.id + '/comment', _comment).subscribe((response: any) => {
        this.loadComment();
      }, error => {
      });
    } else {
      this.notifyService.printErrorMessage('Xin hãy đăng nhập trước khi thực hiện hành động này!');
    }
  }

  loadComment() {
    this.dataService.get('/tours/post/' + this.tourPost.id + '/comment/get-all').subscribe((response: any) => {
      this.listComment = response;
      for (var i in this.listComment) {
        this.dataService.get('/user/account/' + this.listComment[i].commentByID).subscribe((response: any) => {
          for (var i in this.listComment) {
            if (this.listComment[i].commentByID == response.id) {
              this.listComment[i]['userName'] = response.userName;
            }
          }
          // this.listComment[this.listComment.findIndex(item => item.commentByID === response.id)]["userName"] = response.userName;
        }, error => {
        });
      }
    }, error => {
    });
  }

  openCloseCmt() {
    this.loadComment();
    this.statusComment = !this.statusComment;
  }

  openCloseReport() {
    this.statusReport = !this.statusReport;
  }

  likeTourPost(tourPost: any) {
    if (this.user != null && !tourPost.liked) {
      let _like = new Like(null, tourPost.id, this.user.id, 0);
      this.dataService.post('/tours/post/' + tourPost.id + '/Like', _like).subscribe((response: any) => {
        this.tourPost.liked = true;
        this.tourPost.likedID = response.id;
        this.tourPost.countLike++;
        localStorage.removeItem('tourPost');
        localStorage.setItem('tourPost', JSON.stringify(this.tourPost));
      }, error => {
      });
      this.notifyService.printSuccessMessage('Thích bài viết thành công!');
    } else if (this.user != null && tourPost.liked) {
      if (tourPost.likedID == 0) {
        let _relike = new Like(tourPost.likedID, tourPost.id, this.user.id, 0);
        this.dataService.put('/tours/post/' + tourPost.id + '/Like', _relike).subscribe((response: any) => {
          this.tourPost.likedID = response.id;
          this.tourPost.countLike++;
          localStorage.removeItem('tourPost');
          localStorage.setItem('tourPost', JSON.stringify(this.tourPost));
        }, error => {
        });
        this.notifyService.printSuccessMessage('Thích bài viết thành công!');
      } else {
        let _dislike = new Like(tourPost.likedID, tourPost.id, this.user.id, 1);
        this.dataService.put('/tours/post/' + tourPost.id + '/Like', _dislike).subscribe((response: any) => {
          this.tourPost.likedID = 0;
          this.tourPost.countLike--;
          localStorage.removeItem('tourPost');
          localStorage.setItem('tourPost', JSON.stringify(this.tourPost));
        }, error => {
        });
        this.notifyService.printSuccessMessage('Bỏ thích bài viết thành công!');
      }
    } else {
      this.notifyService.printErrorMessage('Xin hãy đăng nhập trước khi thực hiện hành động này!');
    }
  }

  logout() {
    window.localStorage.removeItem('CURRENT_USER');
    this.user = this.authentication.getLoggedInUser();
    this.notifyService.printSuccessMessage('Đăng xuất thành công!');
    // this.notifyService.printConfirmationDialog("Bạn có chắc chắn muốn đăng xuất?" , this.resetLogin)
  }
}
