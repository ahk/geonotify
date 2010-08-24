class AreasController < ApplicationController
  before_filter :load_area, :only => [:show, :edit, :update, :destroy]

  def index
    @areas = current_user.areas
    respond_to do |format|
      format.json { render :text => @areas.to_json, :content_type => 'application/json' }
    end
  end

  def show
    # loaded by load_area
  end

  def new
    @area = Area.new
  end

  def create
    @area = current_user.areas.new(params[:area])
     if @area.save
      flash[:success] = 'Area of interest added.'
      redirect_to account_path
    else
      render :action => :new
    end
  end

  def edit
    # loaded by load_area
  end

  def update
    if @area.update_attributes(params[:area])
      flash[:success] = "Area of interest updated"
      redirect_to account_path
    else
      render :action => :edit
    end
  end

  def destroy
    @area.destroy and redirect_to account_path
  end

  private

  def load_area
    @area = current_user.areas.find(params[:id])
  end


end
