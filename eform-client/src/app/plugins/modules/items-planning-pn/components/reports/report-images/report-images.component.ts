import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Gallery, GalleryItem, ImageItem} from '@ngx-gallery/core';
import {Subscription} from 'rxjs';
import {Lightbox} from '@ngx-gallery/lightbox';
import {TemplateFilesService} from 'src/app/common/services';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';

@AutoUnsubscribe()
@Component({
  selector: 'app-report-images',
  templateUrl: './report-images.component.html',
  styleUrls: ['./report-images.component.scss']
})
export class ReportImagesComponent implements OnChanges, OnDestroy {
  @Input() imageNames: {key: string, value: string}[] = [];
  images = [];
  galleryImages: GalleryItem[] = [];
  imageSub$: Subscription;

  constructor(public gallery: Gallery, public lightbox: Lightbox, private imageService: TemplateFilesService) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.imageNames) {
      this.imageNames.forEach(imageValue => {
        this.imageSub$ = this.imageService.getImage(imageValue.value).subscribe(blob => {
          const imageUrl = URL.createObjectURL(blob);
          this.images.push({
            src: imageUrl,
            thumbnail: imageUrl,
            name: imageValue.key
            // fileName: value.uploadedDataObj.fileName,
            // text: value.id.toString(),
            // uploadedObjId: value.uploadedDataObj.id
          });
        });
      });
      if (this.images.length > 0) {
        this.updateGallery();
      }
    }
  }

  updateGallery() {
    this.galleryImages = [];
    this.images.forEach(value => {
      this.galleryImages.push( new ImageItem({ src: value.src, thumb: value.thumbnail }));
    });
  }

  openPicture(i: any) {
    this.updateGallery();
    if (this.galleryImages.length > 1) {
      this.gallery.ref('lightbox', {counterPosition: 'bottom', loadingMode: 'indeterminate'}).load(this.galleryImages);
      this.lightbox.open(i);
    } else {
      this.gallery.ref('lightbox', {counter: false, loadingMode: 'indeterminate'}).load(this.galleryImages);
      this.lightbox.open(i);
    }
  }

  ngOnDestroy(): void {
  }
}
