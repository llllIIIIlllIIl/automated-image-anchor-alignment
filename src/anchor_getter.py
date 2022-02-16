import face_recognition
import time


def get_face_centre(bar_x, bar_y, points_ancrages):
    """
    Given a set of barycenters of boxes, returns the index of the box
    that is closest to the center of the image
    Parameters
    ----------
    - bar_x, bar_y : int
        center of the image, from which distance is calculated
    - points_ancrages : list of tuples (x,y)
        each tuple being the coordinates of a box described in face_locations
    
    Returns
    -------
        - minimum : the index of the face closest to the center of the image
    """
    # avoid computing in the trivial case of a single face present in the image
    if len(points_ancrages) == 1:
        return 0
    distances = []
    # computing distances between faces centers and the picture center
    for point in points_ancrages:
        distances.append((((bar_x - point[0])**2+(bar_y - point[1])**2))**(1/2))
    best_face = distances.index(min(distances))
    return best_face

def get_points_ancrage(face_locations):
    """Given a set of coordinates describing boxes surrounding detected
    faces, returns coordinates of the barycentre of these boxes.
    Parameters
    ----------
        - face_locations : A list of tuples of found face locations
            in css (top, right, bottom, left) order.
            given by the function face_recognition.face_locations()
    Returns
    -------
        - points_ancrages : list of tuples (x,y), each tuple being
            the coordinates of the barycenter of a box described
            in face_locations[]
    """
    points_ancrage = []
    for face, coord in enumerate(face_locations):
        x = round((coord[1] + coord[3]) / 2)
        y = round((coord[0] + coord[2]) / 2)
        points_ancrage.append((x, y))
    return points_ancrage

def get_face_surface(box):
    """Given two points describing a box, return the surface of the box
    Parameters
    ----------
        - box: tuple of ints
            sublist of face_locations list given by the
            face_recognition.face_locations() function
    Returns
    -------
        - Surface : int
            surface of the box framing the detected object
    """
    # box coordinates = (y1, x1, y2, x2)
    surface = (box[2] - box[0]) * (box[1] - box[3])
    return surface
    

def get_ancrage(image):
    """
    Given an image, returns the position of the face that is the closest to the
    center of the image. Position in the center of the face, the end goal being
    aligning multiple faces in order to produce a video.
    Parameters
    ----------
        - image : ndarray
            image imported as a ndarray using the
            face_recognition.load_image_file() function
    Returns
    -------
        - list : [tuple of int, surface(int)]
            - tuple of int (x, y) describing the center of the box framing the
            face that is closest to the center of the image.
            - surface of the box
    """
    # computing the coordinates of the center of the image as bar_x bar_y
    bar_x = round(image.shape[0]/2)
    bar_y = round(image.shape[1]/2)
    # detecting faces using the face_recognition library
    face_locations = face_recognition.face_locations(image)
    # Flag to skip image if no faces detected
    if len(face_locations) == 0 or face_locations[0] == ():
        return False
    # getting list of the centers of the faces
    points_ancrage = get_points_ancrage(face_locations)
    # getting index of the face closest to the center
    best_face = get_face_centre(bar_x, bar_y, points_ancrage)
    surface = get_face_surface(face_locations[best_face])
    return [points_ancrage[best_face], surface]
    
